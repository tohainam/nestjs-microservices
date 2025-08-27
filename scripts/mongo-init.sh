#!/bin/bash
set -e

# Optional: set these if you use authentication
MONGO_USER=${MONGO_INITDB_ROOT_USERNAME:-}
MONGO_PASS=${MONGO_INITDB_ROOT_PASSWORD:-}
AUTH_ARGS=""
if [ -n "$MONGO_USER" ] && [ -n "$MONGO_PASS" ]; then
  AUTH_ARGS="--username $MONGO_USER --password $MONGO_PASS --authenticationDatabase admin"
fi

MAX_RETRIES=30
SLEEP_TIME=4

wait_for_mongo() {
  local host=$1
  local port=$2
  local retries=0
  echo "Waiting for $host:$port..."
  until mongosh $AUTH_ARGS --host "$host" --port "$port" --eval "db.adminCommand('ping')"; do
    retries=$((retries+1))
    if [ $retries -ge $MAX_RETRIES ]; then
      echo "Failed to connect to $host:$port after $MAX_RETRIES attempts. Exiting."
      exit 1
    fi
    sleep $SLEEP_TIME
  done
}


wait_for_mongo "mongodb1" 27017
wait_for_mongo "mongodb2" 27018
wait_for_mongo "mongodb3" 27019

echo "All MongoDB containers are reachable. Forcing replica set reconfiguration..."

# Configure the replica set with the correct hostnames AND ports
mongosh $AUTH_ARGS --host mongodb1:27017 --eval '
  var config = {
    _id: "rs0",
    members: [
      { _id: 0, host: "mongodb1:27017" },
      { _id: 1, host: "mongodb2:27018" },
      { _id: 2, host: "mongodb3:27019" }
    ]
  };
  try {
    rs.reconfig(config, {force: true});
    print("Replica set reconfigured with correct service names and ports.");
  } catch (e) {
    print("Error during reconfig (might not be initiated yet): " + e);
    try {
      rs.initiate(config);
      print("Replica set initiated.");
    } catch (e2) {
      print("Error during initiate: " + e2);
    }
  }
'