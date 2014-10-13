Contacts-app
============

Project Overview
----------------

Simple web application for gathering and editing a user's contacts.

Requirements
------------

- User account
- Create contact
- Delete contact
- Edit contacts
- Contact fields should include
  - first name
  - last name
  - company name
  - phone
  - address
  - birthday
  - additional notes
- Search contact list
- Contact grouping/sorting via tagging/labels

Phase 2 Features
----------------

- Port project over to OSX, iOS, and Android as a native app
- Sync contacts

To run
------

- Mongod must be running on port 27017
- Python 2.7, virtualenv
- Activate virtualenv:
    `source venv/bin/activate`
- Run app on port 5000:
    `python app.py`

Proposed Schema
---------------

    {
    	"name": "",
    	"password": "",
    	"contacts":
    		[
    			{
    				"lastName": "",
    				"firstName": "",
    				"company": "",
    				"phone": "",
    				"address": "",
    				"birthday": "",
    				"notes": "",
    				"tags" : []
    			}
    		]
    }
