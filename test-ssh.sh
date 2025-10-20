#!/bin/bash
echo "Тестируем SSH подключение..."
ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no fastuser@95.67.11.37 "echo 'SSH работает!' && whoami && pwd"
