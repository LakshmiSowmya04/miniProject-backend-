import random
from datetime import datetime, timedelta

# Settings
users = [9, 10, 11, 12, 13]
num_entries_per_user = 40  # 40 rows per user => 200 entries total
start_date = datetime(2024, 3, 17)

# Define appliance sets for each user (you can add more appliances as needed)
appliance_sets = {
    9: ["refrigerator", "ac", "lights", "washer", "microwave"],
    10: ["refrigerator", "ac", "lights", "washer", "tv"],
    11: ["refrigerator", "ac", "lights", "washer", "oven", "heater"],
    12: ["refrigerator", "ac", "lights", "washer", "fan"],
    13: ["refrigerator", "ac", "lights", "washer", "computer", "waterHeater"]
}

# Start building the INSERT statement
print("INSERT INTO `PowerConsumptions` (`userId`, `date`, `dailyPower`, `totalPower`, `avgDailyPower`, `applianceBreakdown`)")
print("VALUES")

values = []

for user in users:
    for i in range(num_entries_per_user):
        entry_date = (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
        
        daily_power = round(random.uniform(30, 70), 1)
        total_power = daily_power
        avg_daily = round(daily_power + random.uniform(-5, 5), 1)
        
        breakdown = {}
        for appliance in appliance_sets[user]:
            breakdown[appliance] = round(random.uniform(3, 20), 1)
        breakdown_str = str(breakdown).replace("'", '"')
        
        row = f"({user}, '{entry_date}', {daily_power}, {total_power}, {avg_daily}, '{breakdown_str}')"
        values.append(row)

print(",\n".join(values) + ";")
