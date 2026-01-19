from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import json, sys

# Load model
model_name = "google/flan-t5-small"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Load sales JSON
file_path = sys.argv[1]
with open(file_path) as f:
    sales = json.load(f)

# ---- COMPUTATION IN PYTHON (NOT MODEL) ----
total_sales = sum(item["price"] for item in sales)

top_product = max(sales, key=lambda x: x["price"])["product"]

category_totals = {}
for item in sales:
    cat = item.get("category", "Other")
    category_totals[cat] = category_totals.get(cat, 0) + item["price"]

top_category = max(category_totals, key=category_totals.get)

# ---- MODEL ONLY WRITES TEXT ----
prompt = f"""
Rewrite the following facts into ONE clear, factual sentence.
Do NOT add new information.
Do NOT invent history or brands.
Use only the provided facts.

Facts:
- Total sales: Rs {total_sales}
- Top product: {top_product}
- Top category: {top_category}

Sentence:
"""


inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=120)

summary = tokenizer.decode(outputs[0], skip_special_tokens=True)

# Final output for backend
result = {
    "total_sales": total_sales,
    "top_product": top_product,
    "top_category": top_category,
    "summary": summary
}

print(json.dumps(result))
