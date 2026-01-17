"""
Aadhaar Enrolment & Update Insight Platform - Backend API
FastAPI application providing before/after analysis endpoints for Aadhaar data.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import before, after
from analytics import fraud, operations, predictive, geographic, descriptive, quality, advanced, executive


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Pre-loads data on startup for faster API responses.
    """
    # Import data_loader to trigger data loading
    print("Loading Aadhaar datasets...")
    from data_loader import load_all_data
    try:
        data = load_all_data()
        print(f"✓ Loaded enrolment data: {len(data['enrolment']):,} rows")
        print(f"✓ Loaded demographic data: {len(data['demographic']):,} rows")
        print(f"✓ Loaded biometric data: {len(data['biometric']):,} rows")
        print("Data loading complete!")
    except Exception as e:
        print(f"Warning: Error pre-loading data: {e}")
    
    yield  # Application runs here
    
    print("Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Aadhaar Enrolment & Update Insight Platform",
    description="""
    ## Before vs After Analysis API + Audit-Grade Analytics

    This API demonstrates the transformation of raw Aadhaar data into meaningful 
    societal insights, trends, anomalies, and predictive indicators.

    ### Core Modules
    - **Before/After Analysis**: Basic stats vs insights
    - **Fraud & Integrity**: Benford's Law, outliers, patterns
    - **Operational Efficiency**: Queuing, load balancing, throughput
    - **Predictive Intelligence**: Forecasting, regression, scenarios
    - **Geographic & Demographic**: Clusters, hotspots, cohorts

    Built for UIDAI, NIC, and MeitY demonstration.
    """,
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative React port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(before.router)
app.include_router(after.router)
app.include_router(fraud.router)
app.include_router(operations.router)
app.include_router(predictive.router)
app.include_router(geographic.router)
app.include_router(descriptive.router)
app.include_router(quality.router)
app.include_router(advanced.router)
app.include_router(executive.router)



@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Aadhaar Enrolment & Update Insight Platform",
        "version": "2.0.0",
        "description": "Audit-Grade Analytics Dashboard",
        "modules": {
            "fraud": "/api/fraud",
            "operations": "/api/operations",
            "predictive": "/api/predictive",
            "geographic": "/api/geographic",
            "legacy_before": "/api/before",
            "legacy_after": "/api/after"
        },
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "aadhaar-analytics-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
