from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

user = [
    {'username': 'arcalinea',
     'bot': '1%'}
    ]

@app.route('/api/v1/twitter/users', methods=['GET'])
def api_id():
    if 'id' in request.args:
        return jsonify(user)
    else:
        return "Error: No id field provided. Please specify an id."


if __name__ == '__main__':
    app.run()
