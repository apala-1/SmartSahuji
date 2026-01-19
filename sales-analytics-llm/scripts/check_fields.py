from pymongo import MongoClient

client = MongoClient("mongodb://127.0.0.1:27017")

print("Databases:", client.list_database_names())

db = client["smartSahuji"]   # <-- change here if needed
print("Collections:", db.list_collection_names())

collection = db["sales"]     # <-- change here if needed
print("Total documents:", collection.count_documents({}))

sample = collection.find_one()
print("Sample document:", sample)
