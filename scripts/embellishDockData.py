# This file adapted from the work of Nate at Transportation Alternatives.
# Thanks, Nate!! Couldn't have done it without you. :)

import requests
import csv
import geopandas as gpd
from shapely.geometry import Point

# Function to find the matching boundary
def find_matching_boundary(geometry, boundaries, field_name):
    for idx, boundary in boundaries.iterrows():
        if geometry.intersects(boundary.geometry):
            return boundary[field_name]
    return ""

# Function to fetch Citi Bike data and update boundaries
def update_citibike_data():
    # Define the URLs for boundaries data
    council_districts_url = "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/NYC_City_Council_Districts_Water_Included/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=pgeojson"
    community_districts_url = "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/NYC_Community_Districts_Water_Included/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=pgeojson"
    boroughs_url = "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/NYC_Borough_Boundary_Water_Included/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=pgeojson"

    # Load boundaries data
    council_districts = gpd.read_file(council_districts_url)
    community_districts = gpd.read_file(community_districts_url)
    boroughs = gpd.read_file(boroughs_url)

    # Load Docks
    with open("/tmp/citibike/docks.csv", "r") as csv_file:
        csv_reader = csv.DictReader(csv_file)
        dock_data = list(csv_reader)

    # Create a new column for each category
    for data in dock_data:
        data["councilDistrict"] = ""
        data["communityDistrict"] = ""
        data["borough"] = ""

    # Match stations with boundaries
    for data in dock_data:
        station_point = Point(float(data["longitude"]), float(data["latitude"]))
        data["councilDistrict"] = find_matching_boundary(station_point, council_districts, "CounDist")
        data["communityDistrict"] = find_matching_boundary(station_point, community_districts, "BoroCD")
        data["borough"] = find_matching_boundary(station_point, boroughs, "BoroName")

    # Save the updated data to a new CSV file
    with open("/tmp/citibike/docks_completed.csv", "w", newline="") as csv_file:
        fieldnames = dock_data[0].keys()
        csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        csv_writer.writeheader()
        csv_writer.writerows(dock_data)

update_citibike_data()
