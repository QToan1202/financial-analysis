
import re
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

from utils.number import NumberRegEx

nltk.download('punkt_tab')
nltk.download('stopwords')
nltk.download('wordnet')


class TextProcessor:
    def __init__(self) -> None:
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))

    def clean_text(self, text: str):
        text = text.lower()
        text = re.sub(r'[^\w\s]', "", text)
        text = " ".join(text.split())

        return text

    def remove_stop_words(self, text: str):
        words = word_tokenize(text)
        filter_words = [word for word in words if word not in self.stop_words]

        return " ".join(filter_words)

    def lemmatize_words(self, text: str):
        words = word_tokenize(text)
        lemmatize_words = [self.lemmatizer.lemmatize(word) for word in words]

        return " ".join(lemmatize_words)

    def preprocessing(self, text: str):
        text = self.clean_text(text)
        text = self.remove_stop_words(text)
        text = self.lemmatize_words(text)

        return text
