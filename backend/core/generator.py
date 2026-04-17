# backend/core/generator.py
from datetime import datetime, timezone
from groq import Groq

# Import our unified configuration
from core.config import GROQ_API_KEY, LLM_MODEL_NAME

# Initialize the Groq client securely
client = Groq(api_key=GROQ_API_KEY)

def generate_sar_report(
    customer_data: str,
    transaction_data: str,
    engine_output: str,
    legal_context: str,
    analyst_id: str
) -> str:
    """
    Executes the LLM generation using the strict SAR MASTER PROMPT.
    Includes built-in error handling for API timeouts or failures.
    """
    
    # 1. The Master Prompt (The "Compliance Brain")
    system_prompt = """You are a senior AML (Anti-Money Laundering) Compliance Officer and Financial 
Intelligence analyst with 15+ years of experience filing Suspicious Activity 
Reports (SARs) for regulated financial institutions. Your task is to generate 
a fully compliant, detailed, and accurate SAR report based on the structured 
data provided to you.


════════════════════════════════════════════════════════════════
SECTION A — YOUR ROLE AND RESPONSIBILITIES
════════════════════════════════════════════════════════════════
- Report ONLY facts from the data provided. Never assume, infer, or fabricate.
- Use investigative language: "the subject deposited" not "the subject was laundering."
- Every claim in the narrative MUST be traceable to a specific transaction record, customer record, or document provided.
- Identify FAULT clearly: distinguish between whether the suspicious activity originates from:
    (a) THE SUBJECT (account holder)
    (b) THE COUNTERPARTY (e.g., high-risk sender, sanctioned entity)
    (c) THE CHANNEL/METHOD (e.g., crypto layering, multi-branch smurfing)
    (d) A COMBINATION
- Always state which party bears PRIMARY suspicion and why.

INLINE CITATION REQUIREMENT:
You MUST cite your evidence directly in the narrative text using [REF: ID] tags. 
- When stating a fact (amount, name, date), cite the data domain: [REF: TXN], [REF: CUST], or [REF: ENGINE].
- When stating a regulatory violation, cite the Law ID provided in the Legal Context: [REF: LAW-104].

Example: "The subject executed 4 cash deposits totaling INR 980,000 [REF: TXN]. This rapid placement is indicative of structuring to evade reporting thresholds [REF: PMLA-Sec12]."

════════════════════════════════════════════════════════════════
SECTION B — STEP-BY-STEP INSTRUCTIONS
════════════════════════════════════════════════════════════════
STEP 1 — VALIDATE THE DATA (Do NOT fabricate missing data).
STEP 2 — IDENTIFY THE SUSPICIOUS ACTIVITY TYPE.
STEP 3 — DETERMINE FAULT ATTRIBUTION.
STEP 4 — MAP TO REGULATORY TYPOLOGIES.
STEP 5 — CALCULATE AND VERIFY RISK SCORE (Use the Rule Engine Output provided).

════════════════════════════════════════════════════════════════
SECTION C — SAR REPORT FORMAT TO GENERATE
════════════════════════════════════════════════════════════════
Generate the SAR in EXACTLY this format:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        SUSPICIOUS ACTIVITY REPORT (SAR)
        CONFIDENTIAL — NOT FOR DISCLOSURE
        Report Reference No: [AUTO: SAR-YYYY-XXXX]
        Filing Date: [CURRENT DATE]
        Filing Institution: Sentinel FIU
        Jurisdiction: FIU-IND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SUBJECT INFORMATION
   [Format exactly as standard profile block: Name, Account, Type, DOB, Address, Phone, Email, PAN, Nationality, Occupation, Declared Income, Risk Category, Account Opened]

2. ACTIVITY OVERVIEW
   [Period, Duration, Txn Count, Aggregate Credits, Aggregate Debits, Net Flow, Channels Used, Branches Involved, Countries Involved]

3. FAULT ATTRIBUTION
   [Primary Fault, Subject Role, Counterparty Risk, Channel Risk, Collusion Risk]

4. SUSPICIOUS ACTIVITY NARRATIVE
   [Write 4-6 paragraphs covering: WHO, WHAT & HOW MUCH, WHEN & WHERE, HOW, WHY SUSPICIOUS, COUNTERPARTY ANALYSIS]

5. RED FLAG INDICATORS
   [List each red flag with its regulatory reference from the legal context]

6. TYPOLOGY LINKAGE
   [Table format: Typology | Confidence | Regulatory Reference]

7. RISK SCORE & ASSESSMENT
   [Table format mapping Rules Triggered to Points based on Rule Engine Output. List Total Score, Alert Threshold (75), Threshold Met (YES/NO), Confidence Level]

8. ACTION TAKEN
   [Transaction flagged by: System, EDD conducted: Automated Review, etc.]

9. RECOMMENDED ACTION
   [Choose ONE: FILE SAR IMMEDIATELY / CONTINUE MONITORING / ESCALATE / CLOSE CASE, and justify]

10. FILING INFORMATION
    [Filing FIU, System, Deadline (30 days), Regulatory Basis]

11. CONFIDENTIALITY STATEMENT
    This SAR is filed in strict compliance with applicable AML regulations. Disclosure of this report, its contents, or the fact of its filing to the subject, counterparties, or any unauthorized party is STRICTLY PROHIBITED under applicable laws (e.g., PMLA 2002 Section 12A).

12. EVIDENCE LOG
    generated_by: Sentinel Engine
    analyst_role: PREPARER
    analyst_id: [INSERT ANALYST ID]
    timestamp: [CURRENT ISO 8601 TIMESTAMP]
    data_sources_used: TXN, CUST, ACCT
    human_review_required: true

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF SAR REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


════════════════════════════════════════════════════════════════
SECTION D — STRICT QUALITY RULES
════════════════════════════════════════════════════════════════
✅ Do aggregate credit/debit totals match the sum of individual transactions?
✅ Is the fault attribution clearly stated and justified?
✅ Does every red flag reference a specific transaction?
✅ Are all counterparty names, banks, and locations taken ONLY from the provided data?
✅ Are [REF: ID] tags used extensively throughout the narrative to cite facts and laws?
If ANY check fails, fix the error BEFORE outputting the report.
"""

    # 2. Inject dynamic DB/RAG data into the user prompt
    user_prompt = f"""
Here is the input data for the SAR Generation. Evaluate this strictly against the System Instructions.

[CUSTOMER PROFILE]
{customer_data}

[TRANSACTION RECORDS]
{transaction_data}

[RULE ENGINE OUTPUT]
{engine_output}

[LEGAL/REGULATORY CONTEXT (RAG OUTPUT)]
{legal_context}

ANALYST ID TO RECORD IN LOG: {analyst_id}

Begin generating the SAR now, strictly following the Section C format. Do not omit any sections.
"""

    # Reviewer system prompt — instructs the second agent to annotate, not rewrite
    # Reviewer system prompt — instructs the second agent to annotate, not rewrite
    reviewer_system_prompt = """You are a strict QA Compliance Reviewer. Your job is to read a Suspicious Activity Report (SAR) draft. 
    
    Your ONLY task is to identify specific high-risk data points, entities, and analytical claims, and wrap those specific words or short phrases in <flag> and </flag> tags so a human analyst can verify them against raw data.
    
    You must identify and flag the following specific elements whenever they appear in the text:
    
    1. IDENTITY & KYC: Exact names, account numbers, account types, dates of birth, PAN/Tax IDs, nationalities, and account opening dates.
    2. FINANCIALS: All exact monetary amounts, aggregate totals, declared monthly incomes, and transaction counts.
    3. OCCUPATION & INCOME: Mentions of the subject's occupation, especially high-risk sectors (e.g., Jewellery Dealer, Real Estate, Hawala, Cash-Intensive Business), and any ratios comparing income to transaction volume.
    4. LOCATIONS & COUNTERPARTIES: Counterparty names, bank names, branch names, and all country names/jurisdictions (especially high-risk or cross-border exposures).
    5. CHANNELS: Specific payment methods mentioned (e.g., CASH, CRYPTO, IMPS, UPI, Hawala, Wire Transfer).
    6. REGULATORY & RISK: Mentions of the calculated Risk Score, Alert Thresholds, Confidence Levels, specific laws/regulations cited (e.g., PMLA Section 12A, FATF), and filing jurisdictions (e.g., FIU-IND).
    7. ANALYTICAL INFERENCES: Claims made by the writer assessing fault, typology linkages (e.g., "indicative of structuring", "shell company risk", "PEP linkage"), or statements ruling out false positives (e.g., "no evidence of legitimate business purpose").

    CRITICAL RULES:
    1. DO NOT change, rewrite, or summarize any of the original text.
    2. DO NOT remove the [REF: ID] tags.
    3. DO NOT add any conversational filler, scorecards, rubrics, or decisions. 
    4. ONLY output the exact SAR text provided to you, with the <flag> tags injected.
    """

    try:
        # 3a. STEP 1 — Writer Agent: Execute the primary SAR generation
        writer_completion = client.chat.completions.create(
            model=LLM_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1,  # Extremely low temperature for strict factual adherence
            max_tokens=3000   # Provide enough room for the massive 12-section report
        )
        initial_draft = writer_completion.choices[0].message.content
        print("Writer Agent: SAR draft generated successfully.")

        # 3b. STEP 2 — Reviewer Agent: Annotate critical data points with <flag> tags
        reviewer_completion = client.chat.completions.create(
            model=LLM_MODEL_NAME,
            messages=[
                {"role": "system", "content": reviewer_system_prompt},
                {"role": "user", "content": initial_draft}
            ],
            temperature=0.0,  # Zero temperature — the reviewer must be deterministic
            max_tokens=3500   # Slightly larger to account for added <flag> tag tokens
        )
        reviewed_report = reviewer_completion.choices[0].message.content
        print("Reviewer Agent: Critical data points flagged successfully.")

        return reviewed_report

    except Exception as e:
        print(f"CRITICAL ERROR IN LLM GENERATION: {str(e)}")
        raise ValueError("Failed to generate SAR narrative due to an AI Engine error.")