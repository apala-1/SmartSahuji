# summarizer.py
from transformers import PegasusTokenizer, PegasusForConditionalGeneration

class InsightsSummarizer:
    def __init__(self):
        self.model_name = "google/pegasus-xsum"
        self.tokenizer = PegasusTokenizer.from_pretrained(self.model_name)
        self.model = PegasusForConditionalGeneration.from_pretrained(self.model_name)

    def summarize_text(self, text: str, max_length=150, min_length=50) -> str:
        # Tokenize input
        inputs = self.tokenizer(text, truncation=True, padding='longest', return_tensors="pt")

        # Generate summary
        summary_ids = self.model.generate(
            inputs["input_ids"],
            max_length=max_length,
            min_length=min_length,
            length_penalty=2.0,
            num_beams=4,
            early_stopping=True
        )

        # Decode
        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary
