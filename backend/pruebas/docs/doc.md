# Contador de Palabras por Archivo de Audio

## Descripción

Esta tarea cuenta el número de palabras en un archivo de audio utilizando técnicas de reconocimiento de voz. El archivo de audio debe estar en formato WAV.

## Parámetros

La tarea acepta el siguiente parámetro:

- **audio_file**: (string) La ruta al archivo de audio en formato WAV que se debe analizar. 

## Ejemplo de Uso

Para ejecutar esta tarea, debes proporcionar la ruta del archivo de audio en formato JSON. A continuación se muestra un ejemplo de cómo se debe estructurar el JSON:

```json
{
  "audio_file": "/Downloads/p.wav"
}
