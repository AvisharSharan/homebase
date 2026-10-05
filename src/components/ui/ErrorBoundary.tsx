import { Component, ReactNode } from "react";
import { downloadText } from "../../lib/export/backup";
import { STORAGE_KEY } from "../../lib/storage/storage";

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean; message: string }> {
  state = { failed: false, message: "" };
  static getDerivedStateFromError() { return { failed: true }; }
  exportSaved = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) throw new Error("No saved data is available.");
      downloadText(raw, "homebase-recovery.json");
    } catch (error) {
      this.setState({ message: error instanceof Error ? error.message : "Storage is unavailable." });
    }
  };
  render() {
    if (this.state.failed) return (
      <main className="mx-auto max-w-lg p-8 space-y-4">
        <h1 className="text-2xl">Homebase could not open this view.</h1>
        <p>Your saved data has not been deleted. Export it before trying again.</p>
        <button className="rounded border p-3" onClick={this.exportSaved}>Export saved data</button>
        <button className="rounded border p-3 ml-2" onClick={() => window.location.reload()}>Reload</button>
        {this.state.message && <p role="alert">{this.state.message}</p>}
      </main>
    );
    return this.props.children;
  }
}
