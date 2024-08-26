import sys
import json
import speech_recognition as sr

def main():
    # Leer los argumentos pasados al script
    if len(sys.argv) != 2:
        print(json.dumps({"status": {"code": -1, "msg": "Se necesita exactamente un argumento en formato JSON."}, "results": {}}))
        sys.exit(1)

    # Convertir el argumento de JSON a un diccionario
    params = json.loads(sys.argv[1])
    audio_file_path = params.get("audio_file")

    if not audio_file_path:
        print(json.dumps({"status": {"code": -1, "msg": "No se ha proporcionado la ruta del archivo de audio."}, "results": {}}))
        sys.exit(1)

    # Inicializar el reconocedor de voz
    recognizer = sr.Recognizer()

    try:
        # Cargar el archivo de audio
        with sr.AudioFile(audio_file_path) as source:
            audio = recognizer.record(source)
            
        # Reconocer el texto en el audio
        text = recognizer.recognize_google(audio)
        words = text.split()
        word_count = len(words)
        
        # Mostrar los resultados
        print(json.dumps({
            "status": {"code": 0, "msg": ""},
            "results": {"word_count": word_count},
            "text": {"text": text},
        }))
    except FileNotFoundError:
        print(json.dumps({"status": {"code": -1, "msg": "El archivo de audio no se encuentra en la ruta especificada."}, "results": {}}))
    except sr.UnknownValueError:
        print(json.dumps({"status": {"code": -1, "msg": "No se pudo entender el audio."}, "results": {}}))
    except sr.RequestError as e:
        print(json.dumps({"status": {"code": -1, "msg": f"Error en la solicitud al servicio de reconocimiento de voz: {str(e)}"}, "results": {}}))
    except Exception as e:
        print(json.dumps({"status": {"code": -1, "msg": f"Error al procesar el archivo de audio: {str(e)}"}, "results": {}}))

if __name__ == "__main__":
    main()
