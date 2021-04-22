from flask import Flask, render_template
#from utility.database import get_cursor, get_named_entities

app = Flask(__name__, static_url_path='/static')


@app.route('/')
def index():
    # db_name = "../wsb_kaggle_jwilling.db"
    # named_entities = get_named_entities(db_name)
    # return render_template("home.html", named_entities=named_entities)
    return render_template("home.html")

# if __name__ == "__main__":
#     app.config['TEMPLATES_AUTO_RELOAD'] = True
#     app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
#     app.run(debug=True)