import os
import pymongo
from flask import Flask, request, session, g, redirect, url_for, \
    abort, render_template, flash

app = Flask(__name__)

# serve the Angular app
# every route to be handled by Angular needs to be
# added here or else 404 error will be thrown by Flask
@app.route('/')
@app.route('/login')
def index():
    return render_template('index.html')

# connect to database 'test' and assign handle 'db'
connection = pymongo.MongoClient('localhost', 27017)
db = connection.test

if __name__ == '__main__':
    app.run(debug=True)