from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# dummy data
user = [
    {'username': 'arcalinea',
     'bot': '1%'}
    ]

# /api/v1/twitter/users?name=test1?
@app.route('/api/v1/twitter/users', methods=['GET'])
def api_name():
    if 'name' in request.args:
        return jsonify(user)
    else:
        return "Error: No name field provided. Please specify an name."

# best way to query multiple at once?
# /api/v1/twitter/users?names=test1,test2,test3
@app.route('/api/v1/twitter/users', methods=['GET'])
def api_names():
    if 'names' in request.args:
        return jsonify(user)
    else:
        return "Error: No names field provided. Please pass comma-separated names."

if __name__ == '__main__':
    app.run()
