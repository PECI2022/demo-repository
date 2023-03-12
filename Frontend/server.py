from flask import Flask, send_from_directory, request, render_template

app = Flask(__name__)

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/')
def default():
    return render_template('index.html')

@app.route('/<path:path>')
def static_route(path):
    print(path)
    return render_template(path+'.html')


if __name__ == '__main__':
    app.run(debug=True, port=8081)