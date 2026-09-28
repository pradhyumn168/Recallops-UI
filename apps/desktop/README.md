# RecallOps Desktop Application (Electron Shell)

The desktop client provides a dedicated, native mission-control window for RecallOps incident responders.

## Architecture

- **Thin Client**: The Electron app is a lightweight shell that loads the React web client and communicates with the same unified FastAPI backend (`http://localhost:8000`).
- **Zero Business Logic Duplication**: All incident normalization, deterministic outcome-ranked scoring, briefing guard validation, Hindsight memory recall/retention, and Groq failover occur centrally in `services/api`.
- **Operating Systems**: Windows, macOS, Linux.

## Running Locally

1. Ensure the backend is running:
   ```bash
   python -m uvicorn app.main:app --app-dir services/api --port 8000 --reload
   ```

2. Start the web frontend dev server:
   ```bash
   npm run dev --prefix apps/web
   ```

3. Launch the Electron shell:
   ```bash
   npm run dev --prefix apps/desktop
   ```
