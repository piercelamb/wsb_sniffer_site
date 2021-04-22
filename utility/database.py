# import sqlite3
# import pandas as pd
# import json
#
# def get_cursor(db_name):
#     conn = sqlite3.connect(db_name)
#     return conn.cursor()
#
# def get_named_entities(db_name):
#     conn = sqlite3.connect(db_name)
#     query = "SELECT entity, count " \
#             "FROM named_entities " \
#             "ORDER BY count DESC " \
#             "LIMIT 10"
#     named_ents_raw = pd.read_sql_query(query, conn)
#     chart_data = named_ents_raw.to_dict(orient='records')
#     data = {'entities_data': chart_data}
#     return data