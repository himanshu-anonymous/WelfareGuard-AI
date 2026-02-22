import torch
import torch.nn as nn

class FraudDetectionNN(nn.Module):
    def __init__(self):
        super(FraudDetectionNN, self).__init__()
        # MLP taking 3 inputs: stated_income, extracted_income, rings_flagged_count
        self.network = nn.Sequential(
            nn.Linear(3, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 1),
            nn.Sigmoid() # Outputs between 0.0 and 1.0
        )
        
        # For the hackathon MVP, we manually set weights so that
        # large income discrepancies or ring activity trigger a high fraud score
        with torch.no_grad():
            self.network[0].weight.data = torch.randn(16, 3)
            # Make the first neuron highly sensitive to (extracted - stated) and rings
            self.network[0].weight.data[0] = torch.tensor([-1.0, 1.0, 5.0])
            self.network[0].bias.data = torch.randn(16)
            
            self.network[2].weight.data = torch.randn(8, 16)
            self.network[2].weight.data[0][0] = 5.0 # Pass the signal through
            
            self.network[4].weight.data = torch.randn(1, 8)
            self.network[4].weight.data[0][0] = 5.0

    def forward(self, x):
        return self.network(x)

# Initialize and move back/forth to constraints
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = FraudDetectionNN().to(device)
model.eval()

def calculate_fraud_probability(stated_income: float, extracted_income: float, rings_flagged_count: int) -> float:
    """
    Inferences the Neural Network.
    Returns a probability score between 0.0 and 1.0 based on inputs.
    """
    # Normalize the inputs for the network
    norm_stated = stated_income / 100000.0 if stated_income else 0.0
    norm_extracted = extracted_income / 100000.0 if extracted_income else 0.0
    norm_rings = float(rings_flagged_count)
    
    # RORO pattern applied with PyTorch tensors
    input_tensor = torch.tensor([[norm_stated, norm_extracted, norm_rings]], dtype=torch.float32).to(device)
    
    with torch.no_grad():
        output = model(input_tensor)
        
    return output.item()
