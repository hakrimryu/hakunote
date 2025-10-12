# 🧩 1. Unity Gaming Service Introduction

**UGS (Unity Gaming Services)** is Unity’s cloud-based backend service.  
Without building or maintaining your own servers, you can use features like sign‑in, cloud save, leaderboards, and remote configuration right away.

&nbsp;

## What is UGS?

[Unity official page](https://unity.com/solutions/gaming-services)

**UGS (Unity Gaming Services)** is an **official cloud‑based backend platform** provided by Unity.  
You can integrate major features into your project quickly, without self‑hosting or server maintenance.

| Feature                 | Description                                        |
| :---------------------- | :------------------------------------------------- |
| 🔐 **Authentication**   | Player sign‑in and unique ID management            |
| ☁️ **Cloud Save**       | Save and load progress data in the cloud           |
| 🏆 **Leaderboards**     | Score submission, ranking display, season support  |
| ⚙️ **Remote Config**    | Ship parameter changes without a new build         |
| 🧠 **Cloud Code**       | Short server‑side logic (e.g., cheat checks, rewards)

&nbsp;

## Why even for single‑player?

UGS isn’t just for multiplayer.  
It’s highly useful for single‑player games as well, for example:

- 🔄 **Sync progress**: Continue playing across devices
- 🛠 **Live operations**: Adjust events and reward balance via config
- 🎯 **Fairness**: Server validation helps prevent cheating
- 📈 **Scalability**: Handle traffic spikes with the cloud

&nbsp;

> The goal is to deliver a “server‑like experience” **without** running your own servers.

&nbsp;

## Features used in this project

In this series we’ll focus on the following four services:

1. 🔐 **Authentication** — Player identity and sign‑in (using anonymous login)
2. ☁️ **Cloud Save** — Save and load to/from the cloud
3. 🏆 **Leaderboards** — Submit scores and display rankings
4. ⚙️ **Remote Config** — Distribute/adjust parameters (including A/B tests)

At the end, we’ll also add a small server routine with **Cloud Code**.

&nbsp;

## Pricing / Plans

- Many features include a **Free Tier**.  
  It’s usually enough during development or test phases.
- Before release, confirm the pricing model based on **DAU** (daily active users) or your expected usage.

&nbsp;

## Wrap‑up

> UGS is an **integrated suite** that lets Unity projects add key backend features quickly **without** running your own servers.

In this article we organized the overview and use cases.  
Next, we’ll implement setup steps and code examples for each service.  
We’ll aim to get things running with the **fewest scripts** and the **shortest path** possible.
