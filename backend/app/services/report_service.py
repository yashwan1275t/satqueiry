import datetime
from pathlib import Path
from typing import Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable
)
from app.config import settings

class ReportService:
    @staticmethod
    def generate_pdf_report(
        job_id: str,
        chat_title: str,
        query: str,
        result_data: dict[str, Any]
    ) -> Path:
        reports_dir = settings.STORAGE_DIR / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d_%H%M%S")
        pdf_path = reports_dir / f"SatQuery_Report_{job_id[:8]}_{timestamp_str}.pdf"

        doc = SimpleDocTemplate(
            str(pdf_path),
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )

        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            "ReportTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#0891b2")  # Cyan/Teal
        )
        subtitle_style = ParagraphStyle(
            "ReportSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#64748b")
        )
        h2_style = ParagraphStyle(
            "ReportH2",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "ReportBody",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#334155")
        )
        meta_label_style = ParagraphStyle(
            "MetaLabel",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#475569")
        )
        meta_value_style = ParagraphStyle(
            "MetaVal",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#0f172a")
        )

        story = []

        # 1. Header
        story.append(Paragraph("SATQUERY AI", title_style))
        story.append(Paragraph("Research-Grade Remote Sensing Intelligence Platform", subtitle_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0891b2"), spaceAfter=15))

        # 2. Metadata Box
        task_name = result_data.get("task", "Remote Sensing Analysis")
        confidence = result_data.get("confidence", 0.0)
        models_str = ", ".join(result_data.get("models", [])) or "Specialist RS Vision"
        time_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        meta_data = [
            [Paragraph("Session:", meta_label_style), Paragraph(chat_title, meta_value_style),
             Paragraph("Generated At:", meta_label_style), Paragraph(time_str, meta_value_style)],
            [Paragraph("Task:", meta_label_style), Paragraph(task_name, meta_value_style),
             Paragraph("Confidence:", meta_label_style), Paragraph(f"{confidence*100:.1f}%", meta_value_style)],
            [Paragraph("Models Used:", meta_label_style), Paragraph(models_str, meta_value_style),
             Paragraph("Job ID:", meta_label_style), Paragraph(job_id[:12], meta_value_style)]
        ]

        t_meta = Table(meta_data, colWidths=[90, 180, 90, 170])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 15))

        # 3. Query Section
        story.append(Paragraph("User Query", h2_style))
        story.append(Paragraph(f"<i>\"{query}\"</i>", body_style))
        story.append(Spacer(1, 10))

        # 4. Executive Summary / Answer
        story.append(Paragraph("Analysis Findings & Synthesis", h2_style))
        # Strip markdown hashes for clean PDF rendering
        raw_answer = result_data.get("answer", "")
        cleaned_paragraphs = [p.replace("### ", "").replace("## ", "").replace("**", "") for p in raw_answer.split("\n\n") if p.strip()]
        for p in cleaned_paragraphs:
            story.append(Paragraph(p, body_style))
            story.append(Spacer(1, 6))

        story.append(Spacer(1, 10))

        # 5. Spatial Evidence Items
        evidence_list = result_data.get("evidence", [])
        if evidence_list:
            story.append(Paragraph("Spatial Evidence & Feature Detections", h2_style))
            ev_table_data = [
                [Paragraph("Feature Label", meta_label_style),
                 Paragraph("Type", meta_label_style),
                 Paragraph("Confidence", meta_label_style),
                 Paragraph("Coordinates / Extent", meta_label_style)]
            ]
            for ev in evidence_list:
                ev_table_data.append([
                    Paragraph(str(ev.get("label", "Detection")), body_style),
                    Paragraph(str(ev.get("type", "bbox")), body_style),
                    Paragraph(f"{float(ev.get('confidence', 0.8))*100:.1f}%", body_style),
                    Paragraph(str(ev.get("coordinates", "Relative")), body_style)
                ])

            t_ev = Table(ev_table_data, colWidths=[180, 90, 80, 180])
            t_ev.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e0f2fe")),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ]))
            story.append(t_ev)
            story.append(Spacer(1, 15))

        # 6. Auditable Execution Trace
        trace_list = result_data.get("execution_trace", [])
        if trace_list:
            story.append(Paragraph("Auditable Execution Trace", h2_style))
            trace_table_data = [
                [Paragraph("Stage", meta_label_style),
                 Paragraph("Status", meta_label_style),
                 Paragraph("Duration", meta_label_style),
                 Paragraph("Verification Detail", meta_label_style)]
            ]
            for tr in trace_list:
                trace_table_data.append([
                    Paragraph(str(tr.get("step", "")), body_style),
                    Paragraph(str(tr.get("status", "completed")), body_style),
                    Paragraph(f"{tr.get('duration_ms', 50)} ms", body_style),
                    Paragraph(str(tr.get("detail", "OK")), body_style)
                ])

            t_trace = Table(trace_table_data, colWidths=[150, 70, 60, 250])
            t_trace.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ]))
            story.append(t_trace)
            story.append(Spacer(1, 15))

        # 7. Warnings / Sensor Limitations
        warnings = result_data.get("warnings", [])
        if warnings:
            story.append(Paragraph("Sensor Quality Caveats & Limitations", h2_style))
            for w in warnings:
                story.append(Paragraph(f"• {w}", body_style))
            story.append(Spacer(1, 10))

        # 8. Footer
        story.append(Spacer(1, 15))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=10))
        story.append(Paragraph("Confidential & Proprietary — Generated by SatQuery AI Platform", subtitle_style))

        doc.build(story)
        return pdf_path
