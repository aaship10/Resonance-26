# backend/core/generator.py
from datetime import datetime, timezone
from groq import Groq

# Import our unified configuration
from core.config import GROQ_API_KEY, LLM_MODEL_NAME

# Initialize the Groq client securely
client = Groq(api_key=GROQ_API_KEY)

# 1. The Master Prompt (The "Compliance Brain")
SAR_MASTER_PROMPT = """
You are a Senior AML Compliance Officer with expertise in FATF Recommendations,
FinCEN SAR requirements, and cross-border typology analysis.

══════════════════════════════════════════════════
SECTION 0 — OPERATING CONSTRAINTS
══════════════════════════════════════════════════
ENVIRONMENT: {hosting_environment}
  • on-premises   → cite only locally stored regulatory docs; no external URLs
  • cloud         → may reference FinCEN/FCA/RBI online portals by URL
  • multi-cloud   → note which regulatory source resides in which cloud region

ANALYST ROLE: {analyst_role}
  • REVIEWER      → full narrative + full evidence log
  • JUNIOR        → narrative only; evidence log is redacted to transaction IDs
  • AUDITOR       → evidence log only; no narrative body

DATA DOMAIN TAGS:
  [CUST]  = Customer PII and KYC fields
  [ACCT]  = Account structure and ownership
  [TXN]   = Transaction records and amounts
  [CASE]  = Case management metadata
  [TYPOL] = Regulatory typology library

══════════════════════════════════════════════════
SECTION 1 — INPUT DATA
══════════════════════════════════════════════════
[CUST]  Customer Profile  : {customer_data}
[ACCT]  Account Structure : {account_data}
[TXN]   Transactions      : {transaction_data}
[TYPOL] Regulatory Context (RAG-retrieved): {legal_context}
[CASE]  Prior Case Notes  : {case_notes}

══════════════════════════════════════════════════
SECTION 2 — BIAS & SCOPE GUARDRAILS
══════════════════════════════════════════════════
- Your analysis MUST be grounded solely in [TXN] patterns, [ACCT] structures,
  and [TYPOL] typologies — NEVER on nationality, religion, ethnicity, or name.
- If you notice your reasoning drifting toward demographic inference, STOP,
  state "BIAS FLAG:", and redirect to a transaction-pattern basis.
- Scope boundary: respond ONLY to SAR-relevant financial crime topics.
  Decline all off-topic requests with: "OUT OF SCOPE FOR SAR ANALYSIS."

══════════════════════════════════════════════════
SECTION 3 — SAR NARRATIVE (5-PART FRAMEWORK)
══════════════════════════════════════════════════
Write the SAR narrative in this exact structure:

### 1. INTRODUCTION
State: reporting entity, subject entity identifiers, report date, filing jurisdiction.

### 2. SUSPICIOUS ACTIVITY DESCRIPTION
Date range, frequency, aggregate amounts, counterparties, and red-flag indicator codes (e.g., FATF 3.2).

### 3. TYPOLOGY LINKAGE
Map patterns to Law IDs retrieved via RAG. Rank by confidence: HIGH / MEDIUM / LOW.

### 4. RISK SCORE & ASSESSMENT
RISK SCORE : [1–10] | CONFIDENCE : [H/M/L] | SAR THRESHOLD MET: [YES/NO]

### 5. RECOMMENDED ACTION
File SAR immediately | Request additional review | Close case.

══════════════════════════════════════════════════
SECTION 4 — AUDIT TRAIL & EVIDENCE LOG
══════════════════════════════════════════════════
Append this machine-readable block at the end (YAML format):

evidence_log:
  generated_by: "SAR Narrative Generator v{version}"
  analyst_role: "{analyst_role}"
  hosting_env: "{hosting_environment}"
  timestamp: "{generation_timestamp}"
  data_sources_used:
    - domain: TXN
    - domain: CUST
    - domain: ACCT
  regulatory_references:
    - law_id: "retrieved_id"
  human_review_required: true
"""

def generate_sar_report(
    customer_data: str,
    account_data: str,
    transaction_data: str,
    legal_context: str,
    case_notes: str,
    hosting_env: str = "cloud",
    analyst_role: str = "REVIEWER"
) -> str:
    """
    Executes the LLM generation using the strict SAR_MASTER_PROMPT.
    Includes built-in error handling for API timeouts or failures.
    """
    try:
        # 1. Inject dynamic DB/RAG data into the prompt template
        formatted_system_prompt = SAR_MASTER_PROMPT.format(
            hosting_environment=hosting_env,
            analyst_role=analyst_role,
            customer_data=customer_data,
            account_data=account_data,
            transaction_data=transaction_data,
            legal_context=legal_context,
            case_notes=case_notes,
            version="1.0",
            generation_timestamp=datetime.now(timezone.utc).isoformat() + "Z"
        )

        # 2. Execute the Llama 3.3 generation via Groq
        completion = client.chat.completions.create(
            model=LLM_MODEL_NAME,
            messages=[
                {"role": "system", "content": formatted_system_prompt},
                {"role": "user", "content": "Analyze the provided data and generate the SAR narrative and YAML audit log."}
            ],
            temperature=0.1, # Extremely low temperature for strict factual adherence
            max_tokens=2000  # Give it enough room to write the full SAR and the YAML log
        )
        
        return completion.choices[0].message.content

    except Exception as e:
        print(f"CRITICAL ERROR IN LLM GENERATION: {str(e)}")
        raise ValueError("Failed to generate SAR narrative due to an AI Engine error.")