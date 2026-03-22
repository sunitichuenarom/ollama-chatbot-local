@echo off
echo [Ollama] Copying Modelfile to container...
docker cp Modelfile ollama:/Modelfile

echo [Ollama] Creating/Updating model 'qwen-coder'...
docker exec -it ollama ollama create qwen-coder -f /Modelfile

echo [Ollama] Model update complete.
docker exec -it ollama ollama list | findstr qwen-coder
pause
