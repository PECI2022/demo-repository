from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route('/<path>')
def web(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(debug=True, port=5001)