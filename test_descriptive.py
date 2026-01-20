import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from analytics import descriptive
from data_loader import load_all_data

async def test():
    print("Loading data...")
    load_all_data() # Pre-load to avoid issues
    print("Running univariate analysis...")
    try:
        res = await descriptive.univariate_analysis()
        print("Success!")
        print(res.keys())
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
