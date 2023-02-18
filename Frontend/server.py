from flask import Flask, send_from_directory, request, render_template

app = Flask(__name__)


@app.route('/')
def default():
    return render_template('index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/<path>')
def staticRoute(path):
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=8080)