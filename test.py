import os
import sys
import pymongo

connection = pymongo.MongoClient('localhost', 27017)
db = connection.test

username = "admin"
password = "password"

try:
    db.users.insert({"name":username, "password":password})
except pymongo.errors.DuplicateKeyError:
    print "Duplicate key error"
    print "Unexpected error:", sys.exc_info()[0]
except:
    print "Unexpected server error"
    print "Unexpected error:", sys.exc_info()[0]