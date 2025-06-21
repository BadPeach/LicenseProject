import os
import re
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime

#endpoint="processVerilogFile"
endpoint="analyzeCircuit"

# ─── CONFIG ────────────────────────────────────────────────────────────────────
RESULTS_DIR = './results/local_{}'.format(endpoint)
DOCKER_DIR  = './results/local_{}'.format(endpoint)

VUS_LEVELS = [1, 3, 5, 10, 15, 20, 30, 50, 100, 200, 300, 500]

# color per VU level

COLORS = {
    1: 'tab:green',
    3: 'tab:cyan',
    5: 'tab:blue',
    10: 'tab:olive',
    15: 'tab:orange',
    20: 'tab:purple',
    30: 'tab:red',
    50: 'tab:brown',
    100: 'tab:gray',
    200: 'magenta',
    300: 'gold',
    500: 'black',
}

# ─── HELPERS ────────────────────────────────────────────────────────────────────
def parse_k6_summary(path):
    """Extract latency list, total reqs & fails, then compute avg/p90/max lat, total_req & success rate."""
    durs = []
    reqs = []
    fails = []
    with open(path) as f:
        for line in f:
            obj = json.loads(line)
            if obj.get("type") != "Point":
                continue
            m = obj["metric"]
            v = obj["data"]["value"]
            if m == "http_req_duration":
                if v > 0:
                    durs.append(v)
            elif m == "http_reqs":
                reqs.append(v)
            elif m == "http_req_failed":
                fails.append(v)

    total_req  = np.sum(reqs)
    total_fail = np.sum(fails)
    success_rate = 100.0 * (total_req - total_fail) / total_req if total_req > 0 else np.nan

    if durs:
        lat_avg = np.mean(durs)
        lat_p90 = np.percentile(durs, 90)
        lat_max = np.max(durs)
    else:
        lat_avg = lat_p90 = lat_max = np.nan

    return {
        "lat_avg":      lat_avg,
        "lat_p90":      lat_p90,
        "lat_max":      lat_max,
        "total_req":    total_req,
        "success_rate": success_rate
    }

def to_mib(x):
    """Convert strings like '123MiB' or '1.2GB' or '456kB' to MiB float."""
    num, unit = re.match(r"([\d\.]+)(\D+)", x).groups()
    n = float(num)
    u = unit.strip()
    if u.endswith("iB"):
        if u.startswith("Gi"):
            return n * 1024
        elif u.startswith("Mi"):
            return n
        elif u.startswith("Ki"):
            return n / 1024
    if u in ("GB","G"):
        return n * 1024
    if u in ("MB","M"):
        return n
    if u in ("kB","KB","K"):
        return n / 1024
    if u == "B":
        return n / (1024**2)
    return np.nan

def parse_docker_stats_summary(path):
    """
    Read docker stats CSV-style log, skip malformed or lines with '--',
    compute avg CPU%, avg memory (MiB), avg net I/O (MiB), avg block I/O (MiB).
    """
    cpu_vals = []
    mem_vals = []
    net_vals = []
    blk_vals = []

    with open(path) as f:
        for L in f:
            parts = L.strip().split(',')
            if len(parts) < 5 or "--" in parts:
                continue
            try:
                cpu = float(parts[1].rstrip('%'))
                mem_raw = parts[2].split('/')[0].strip()
                net_raw = parts[3].split('/')[0].strip()
                blk_raw = parts[4].split('/')[0].strip()
            except:
                continue

            cpu_vals.append(cpu)
            mem_vals.append(to_mib(mem_raw))
            net_vals.append(to_mib(net_raw))
            blk_vals.append(to_mib(blk_raw))

    return {
        "cpu": np.mean(cpu_vals) if cpu_vals else np.nan,
        "mem": np.mean(mem_vals) if mem_vals else np.nan,
        "net": np.mean(net_vals) if net_vals else np.nan,
        "blk": np.mean(blk_vals) if blk_vals else np.nan,
    }

# ─── GATHER ────────────────────────────────────────────────────────────────────
summary = {}
for vus in VUS_LEVELS:
    k6_file = os.path.join(RESULTS_DIR, f"results_aws_{endpoint}_{vus}vus_20s.json")
    dk_file = os.path.join(DOCKER_DIR,  f"dockerstats_aws_{endpoint}_{vus}vus_20s.log")

    s = parse_k6_summary(k6_file)
    d = parse_docker_stats_summary(dk_file)
    s.update(d)  # adds cpu, mem, net, blk
    summary[vus] = s

# assemble arrays for plotting
vus         = np.array(VUS_LEVELS)
lat_avg     = np.array([summary[v]["lat_avg"]      for v in vus])
lat_p90     = np.array([summary[v]["lat_p90"]      for v in vus])
lat_max     = np.array([summary[v]["lat_max"]      for v in vus])
cpu_use     = np.array([summary[v]["cpu"]          for v in vus])
mem_use     = np.array([summary[v]["mem"]          for v in vus])
net_io      = np.array([summary[v]["net"]          for v in vus])
blk_io      = np.array([summary[v]["blk"]          for v in vus])
succ_rt     = np.array([summary[v]["success_rate"] for v in vus])
total_reqs  = np.array([summary[v]["total_req"]    for v in vus])

# ─── PLOT ────────────────────────────────────────────────────────────────────────
fig, axs = plt.subplots(2, 3, figsize=(18, 10), sharex=False)
axs = axs.flatten()

# 1. Latency vs VUs
axs[0].plot(vus, lat_avg,  marker='o', label='Avg',  color='C0')
axs[0].plot(vus, lat_p90,  marker='o', label='p90',  color='C1')
axs[0].plot(vus, lat_max,  marker='o', label='Max',  color='C2')
axs[0].set_title("Latency vs VUs (ms)")
axs[0].set_ylabel("Latency (ms)")
axs[0].legend()
axs[0].grid(True)

# 2. CPU Usage vs VUs
for v in vus:
    axs[1].scatter(v, summary[v]["cpu"], color=COLORS[v], s=100)
axs[1].plot(vus, cpu_use, linestyle='-', color='black', alpha=0.3)
axs[1].set_title("CPU Usage vs VUs (%)")
axs[1].set_ylabel("CPU %")
axs[1].grid(True)

# 3. Memory Usage vs VUs
for v in vus:
    axs[2].scatter(v, summary[v]["mem"], color=COLORS[v], s=100)
axs[2].plot(vus, mem_use, linestyle='-', color='black', alpha=0.3)
axs[2].set_title("Memory Usage vs VUs (MiB)")
axs[2].set_ylabel("MiB")
axs[2].grid(True)

# 4. Network I/O vs VUs
for v in vus:
    axs[3].scatter(v, summary[v]["net"], color=COLORS[v], s=100)
axs[3].plot(vus, net_io, linestyle='-', color='black', alpha=0.3)
axs[3].set_title("Network I/O vs VUs (MiB)")
axs[3].set_ylabel("MiB")
axs[3].grid(True)

# 5. Block I/O vs VUs
for v in vus:
    axs[4].scatter(v, summary[v]["blk"], color=COLORS[v], s=100)
axs[4].plot(vus, blk_io, linestyle='-', color='black', alpha=0.3)
axs[4].set_title("Block I/O vs VUs (MiB)")
axs[4].set_ylabel("MiB")
axs[4].grid(True)

# 6. Total Requests & Success Rate vs VUs
ax = axs[5]
# total requests line & points
ax.plot(vus, total_reqs,
        marker='o', linestyle='-',
        label='Total Requests',
        color='tab:blue')
ax.set_ylabel("Total Requests", color='tab:blue')
ax.tick_params(axis='y', labelcolor='tab:blue')

# success rate line
ax2 = ax.twinx()
ax2.plot(vus, succ_rt,
         linestyle='--',
         label='Success Rate',
         color='tab:red',
         marker=None)
ax2.set_ylabel("Success Rate (%)", color='tab:red')
ax2.tick_params(axis='y', labelcolor='tab:red')

# only change success‐rate point colors to VU colors
for v in vus:
    # total requests point stays VU‐colored
    ax.scatter(v, summary[v]["total_req"],
               color=COLORS[v], s=100, edgecolor='k', zorder=3)
    # success rate point now VU‐colored
    ax2.scatter(v, summary[v]["success_rate"],
                facecolors=COLORS[v],
                edgecolors='k',
                s=100,
                zorder=3)

ax.set_title("Total Requests & Success Rate vs VUs")
ax.grid(True)



# Plot success rate on right y-axis
ax2 = ax.twinx()
ax2.plot(vus, succ_rt, marker='.', linestyle='--', label='Success Rate', color='tab:red')
ax2.set_ylabel("Success Rate (%)", color='tab:red')
ax2.tick_params(axis='y', labelcolor='tab:red')

# common X label
for a in axs:
    a.set_xlabel("Virtual Users")

plt.tight_layout()
plt.suptitle("Summary Metrics vs Virtual User Levels", fontsize=20, y=1.02)
plt.show()
