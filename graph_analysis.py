import sqlite3
import networkx as nx

def analyze_fraud_rings(db_path="welfare_db.sqlite"):
    """
    Builds a bipartite graph using NetworkX to detect organized proxy networks.
    Any bank account shared by > 3 distinct users flags all associated users.
    Returns the total number of flagged users this cycle.
    """
    conn = sqlite3.connect(db_path, timeout=10)
    cursor = conn.cursor()
    
    # 1. Fetch all applications
    cursor.execute("SELECT aadhaar_id, bank_account FROM applications WHERE bank_account IS NOT NULL")
    records = cursor.fetchall()
    
    # 2. Build a Bipartite Graph
    # Nodes can be 'user' or 'bank'. Edge represents a user claiming that bank account.
    G = nx.Graph()
    for user, bank in records:
        if user and bank:
            G.add_node(user, bipartite=0, type='user')
            G.add_node(bank, bipartite=1, type='bank')
            G.add_edge(user, bank)
    
    # 3. Graph Analysis: Find bank accounts with outsize degrees (> 3 users)
    flagged_users = set()
    reason = "Graph Anomaly: Shared Bank Account (Proxy Network)"
    
    for node, data in G.nodes(data=True):
        if data.get('type') == 'bank':
            degree = G.degree(node)
            if degree > 3:
                # Find all users connected to this suspicious bank account
                connected_users = [n for n in G.neighbors(node) if G.nodes[n].get('type') == 'user']
                flagged_users.update(connected_users)
                
    flagged_count = len(flagged_users)
    
    # 4. Update Database
    if flagged_count > 0:
        flagged_list = list(flagged_users)
        
        # Sequentially update to avoid locking large chunks
        for user in flagged_list:
            cursor.execute("SELECT fraud_probability_score, flag_reason FROM applications WHERE aadhaar_id = ?", (user,))
            row = cursor.fetchone()
            if not row:
                continue
            
            curr_score, curr_reason = row
            curr_score = curr_score or 0
            
            # Avoid duplicate flagging string
            if curr_reason and reason in curr_reason:
                continue
                
            new_score = min(100, curr_score + 85) # High penalty for proxy networks
            if curr_reason:
                new_reason = f"{curr_reason} | {reason}"
            else:
                new_reason = reason
                
            cursor.execute('''
                UPDATE applications
                SET fraud_probability_score = ?, flag_reason = ?
                WHERE aadhaar_id = ?
            ''', (new_score, new_reason, user))
            
        conn.commit()
    
    conn.close()
    return flagged_count

if __name__ == "__main__":
    count = analyze_fraud_rings()
    print(f"Graph Analysis Complete. Flagged {count} users operating in proxy networks.")
