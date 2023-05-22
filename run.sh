echo "Starting MDFAA"

if ! systemctl is-active --quiet docker; then
    echo "Docker is not running"
    sudo systemctl start docker
    echo "Starting docker..."
fi

source venv/bin/activate

echo "Starting mongo container..."
sudo docker start mongo
if [ ! $? -eq 0 ]; then
    echo "Restarting mongo container..."
    sudo lsof -i :27017 | awk '{print $2}' | grep -v "PID" | xargs -I{} sudo kill {}
    sudo docker start mongo
fi

tmux new-session -d -s mysession
tmux split-window -h -t mysession
tmux send-keys -t mysession:0.0 "python Backend/server.py" C-m
tmux send-keys -t mysession:0.1 "python Frontend/server.py" C-m
tmux attach-session -t mysession
