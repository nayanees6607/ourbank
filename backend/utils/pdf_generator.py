# PDF Statement Generator for Vitta Bank
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from io import BytesIO
from datetime import datetime

def generate_statement_pdf(
    account_holder: str,
    account_number: str,
    opening_balance: float,
    closing_balance: float,
    transactions: list,
    start_date: str,
    end_date: str
) -> BytesIO:
    """Generate a bank statement PDF and return as BytesIO"""
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#00D4FF'),
        spaceAfter=12,
        alignment=TA_CENTER
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#64748b'),
        alignment=TA_CENTER
    )
    
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=6
    )
    
    # Bank Header
    elements.append(Paragraph("🏦 VITTA BANK", title_style))
    elements.append(Paragraph("Your Trusted Banking Partner", subtitle_style))
    elements.append(Spacer(1, 20))
    
    # Statement Title
    elements.append(Paragraph("ACCOUNT STATEMENT", header_style))
    elements.append(Paragraph(f"Period: {start_date} to {end_date}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Account Details Table
    account_data = [
        ['Account Holder', account_holder],
        ['Account Number', f"**** **** {account_number[-4:]}"],
        ['Statement Period', f"{start_date} to {end_date}"],
        ['Opening Balance', f"₹{opening_balance:,.2f}"],
        ['Closing Balance', f"₹{closing_balance:,.2f}"]
    ]
    
    account_table = Table(account_data, colWidths=[2.5*inch, 4*inch])
    account_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1e293b')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    elements.append(account_table)
    elements.append(Spacer(1, 30))
    
    # Transaction Header
    elements.append(Paragraph("TRANSACTION HISTORY", header_style))
    elements.append(Spacer(1, 10))
    
    # Transaction Table
    if transactions:
        txn_data = [['Date', 'Description', 'Type', 'Amount']]
        
        for txn in transactions:
            date_str = txn.get('timestamp', '')
            if isinstance(date_str, datetime):
                date_str = date_str.strftime('%d %b %Y')
            elif isinstance(date_str, str) and date_str:
                try:
                    date_str = datetime.fromisoformat(date_str.replace('Z', '+00:00')).strftime('%d %b %Y')
                except:
                    pass
            
            amount = txn.get('amount', 0)
            amount_str = f"₹{abs(amount):,.2f}"
            if amount > 0:
                amount_str = f"+{amount_str}"
            else:
                amount_str = f"-{amount_str}"
            
            txn_data.append([
                date_str,
                txn.get('description', 'N/A')[:40],
                txn.get('transaction_type', 'N/A').title(),
                amount_str
            ])
        
        txn_table = Table(txn_data, colWidths=[1.2*inch, 2.8*inch, 1*inch, 1.5*inch])
        txn_table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0B1221')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            # Data rows
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            # Amount column right-aligned
            ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
        ]))
        elements.append(txn_table)
    else:
        elements.append(Paragraph("No transactions found for this period.", styles['Normal']))
    
    elements.append(Spacer(1, 40))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#94a3b8'),
        alignment=TA_CENTER
    )
    elements.append(Paragraph("This is a computer-generated statement and does not require a signature.", footer_style))
    elements.append(Paragraph(f"Generated on {datetime.now().strftime('%d %b %Y at %I:%M %p')}", footer_style))
    elements.append(Paragraph("© Vitta Bank Pvt. Ltd. All rights reserved.", footer_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
