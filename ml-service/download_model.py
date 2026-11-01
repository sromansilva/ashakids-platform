"""
Descargador de pesos y verificador de caché para Wav2Vec 2.0.
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC

MODEL_NAME = "jonatasgrosman/wav2vec2-large-xlsr-53-spanish"

def main():
    print(f"--- Descargando y verificando modelo '{MODEL_NAME}' ---")
    print("1. Cargando procesador fonetico...")
    processor = Wav2Vec2Processor.from_pretrained(MODEL_NAME)
    print("✅ Procesador listo.")

    print("2. Descargando pesos de la red neuronal (Deep Learning Weights)...")
    model = Wav2Vec2ForCTC.from_pretrained(MODEL_NAME)
    print("✅ Modelo cargado con exito en memoria.")
    print("¡Todo el pipeline de Machine Learning esta listo para inferencias en tiempo real!")

if __name__ == "__main__":
    main()
