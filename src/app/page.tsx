"use client";

import { useMemo, useState } from "react";
import axios from "axios";

type AnalysisResponse = {
    score: number;
    details: {
        angles?: Record<string, number>;
        rula?: Record<string, number>;
        framesAnalyzed?: number;
        fileType?: string;
        annotatedImageJpgBase64?: string | null;
        [k: string]: unknown;
    };
};

export default function HomePage() {
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<AnalysisResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    async function onAnalyze() {
		if (!file) return;
		setLoading(true);
		setError(null);
		setResult(null);
		try {
			const form = new FormData();
			form.append("file", file);
			const res = await axios.post<AnalysisResponse>(
				process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/analyze` : "http://127.0.0.1:8000/analyze",
				form,
				{ headers: { "Content-Type": "multipart/form-data" } }
			);
			setResult(res.data);
		} catch (e: any) {
			setError(e?.response?.data?.detail || e?.message || "Analysis failed");
		} finally {
			setLoading(false);
		}
	}

    function onFileChange(f: File | null) {
        setFile(f);
        setResult(null);
        setError(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(f ? URL.createObjectURL(f) : null);
    }

    const annotatedSrc = useMemo(() => {
        const b64 = result?.details?.annotatedImageJpgBase64;
        return b64 ? `data:image/jpeg;base64,${b64}` : null;
    }, [result]);

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
            <h1 style={{ marginBottom: 8 }}>RULA Analysis</h1>
            <p style={{ color: "#555", marginTop: 0 }}>Upload an image or video. The Python backend (MediaPipe) extracts pose and returns a simplified RULA score with an annotated preview.</p>

            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 320px", minWidth: 320 }}>
                    <div
                        style={{
                            padding: 16,
                            border: "1px solid #e5e7eb",
                            borderRadius: 8,
                            background: "#fafafa"
                        }}
                    >
                        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Upload media</label>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                        />
                        <div style={{ marginTop: 12 }}>
                            <button
                                onClick={onAnalyze}
                                disabled={!file || loading}
                                style={{
                                    padding: "8px 14px",
                                    background: !file || loading ? "#9ca3af" : "#111827",
                                    color: "white",
                                    border: 0,
                                    borderRadius: 6,
                                    cursor: !file || loading ? "not-allowed" : "pointer"
                                }}
                            >
                                {loading ? "Analyzing..." : "Analyze"}
                            </button>
                        </div>

                        {error && <p style={{ color: "#b91c1c", marginTop: 12 }}>{error}</p>}

                        {previewUrl && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ fontWeight: 600, marginBottom: 6 }}>Selected preview</div>
                                <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={previewUrl} alt="Selected media preview" style={{ display: "block", maxWidth: "100%" }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ flex: "2 1 420px", minWidth: 360 }}>
                    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <h2 style={{ margin: 0 }}>Results</h2>
                            {result && <span style={{ color: "#6b7280", fontSize: 14 }}>{result.details?.fileType} · {result.details?.framesAnalyzed} frames</span>}
                        </div>

                        {!result && <p style={{ color: "#6b7280" }}>Run an analysis to see results here.</p>}

                        {result && (
                            <div style={{ display: "grid", gridTemplateColumns: annotatedSrc ? "1fr 1fr" : "1fr", gap: 16 }}>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 18 }}>RULA Score: {result.score}</div>
									<div style={{ display: "grid", gap: 12 }}>
										{/* RULA section */}
										{result.details?.rula && (
											<div style={{ border: "1px solid #e5e7eb", borderRadius: 6 }}>
												<div style={{ padding: "10px 12px", fontWeight: 600, background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>RULA breakdown</div>
												<div style={{ padding: 12 }}>
													<table style={{ width: "100%", borderCollapse: "collapse" }}>
														<thead>
															<tr>
																<th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Segment</th>
																<th style={{ textAlign: "right", padding: "6px 8px", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Score</th>
															</tr>
														</thead>
														<tbody>
															{Object.entries(result.details.rula as Record<string, number>).map(([k, v]) => (
																<tr key={`rula-${k}`}>
																	<td style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>{k}</td>
																	<td style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6", textAlign: "right" }}>{v}</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>
										)}

										{/* Angles section */}
										{result.details?.angles && (
											<div style={{ border: "1px solid #e5e7eb", borderRadius: 6 }}>
												<div style={{ padding: "10px 12px", fontWeight: 600, background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>Joint angles (°)</div>
												<div style={{ padding: 12 }}>
													<table style={{ width: "100%", borderCollapse: "collapse" }}>
														<thead>
															<tr>
																<th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Joint</th>
																<th style={{ textAlign: "right", padding: "6px 8px", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Angle</th>
															</tr>
														</thead>
														<tbody>
															{Object.entries(result.details.angles as Record<string, number>).map(([k, v]) => (
																<tr key={`angle-${k}`}>
																	<td style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>{k}</td>
																	<td style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6", textAlign: "right" }}>{v.toFixed ? v.toFixed(1) : v}</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>
										)}

										{/* Metadata / other fields */}
										<div style={{ border: "1px solid #e5e7eb", borderRadius: 6 }}>
											<div style={{ padding: "10px 12px", fontWeight: 600, background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>Metadata</div>
											<div style={{ padding: 12, display: "grid", rowGap: 6 }}>
												{Object.entries(result.details)
													.filter(([k]) => !["angles", "rula", "annotatedImageJpgBase64"].includes(k))
													.map(([k, v]) => (
														<div key={`meta-${k}`} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
															<div style={{ color: "#6b7280" }}>{k}</div>
															<div style={{ fontWeight: 600 }}>
																{typeof v === "number" ? v : String(v)}
															</div>
														</div>
													))}
											</div>
										</div>
									</div>
                                </div>
                                {annotatedSrc && (
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Annotated skeleton</div>
                                        <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden", background: "#000" }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={annotatedSrc} alt="Annotated skeleton" style={{ display: "block", width: "100%", height: "auto" }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


