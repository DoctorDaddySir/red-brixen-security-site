---
title: "MikroTrick and RouterOS: Why the Router Is Becoming an Attacker's Foothold"
metaTitle: 'MikroTik MikroTrick: RouterOS Attacks Explained'
description: 'CERT Polska observed attackers compromising internet-facing MikroTik routers. We examine CVE-2026-86060, CVE-2026-67277 and the larger lesson.'
date: '2026-09-06'
draft: false
tags:
  [
    'MikroTik',
    'RouterOS',
    'CVE',
    'Router Security',
    'Edge Security',
    'Offensive Security',
    'Vulnerability Research',
  ]
---

## Executive Summary

September 2026 produced one of the more instructive router-security disclosures of the year.

CERT Polska disclosed six RouterOS vulnerabilities discovered during research coordinated with MikroTik. More importantly, researchers confirmed that attackers were already exploiting a combination of vulnerabilities against routers exposing SSH to the public internet.

CERT Polska named the attack chain **MikroTrick**.

CVE-2026-86060 allows manipulation of RouterOS SSH-session privileges through a specially crafted username and can result in full administrative privileges. CVE-2026-67277 is a separate unauthenticated bandwidth-test flaw capable of leaking kernel memory or causing a remote denial of service.

The important story is bigger than either vulnerability.

Routers are attractive because they combine internet exposure, privileged network position, weak endpoint visibility and persistent access to traffic flowing between security zones.

## Vulnerability Snapshot

| CVE            | Function       | Impact                                | CVSS 4.0 |
| -------------- | -------------- | ------------------------------------- | -------- |
| CVE-2026-86060 | SSH login      | Privilege manipulation / admin access | 9.2      |
| CVE-2026-67277 | Bandwidth-test | Kernel memory disclosure / DoS        | 8.8      |

Fixed RouterOS releases include **6.49.21, 7.23.4 and 7.24.2**, with 7.25 beta 3 also containing fixes.

## What Is Vulnerable?

CVE-2026-86060 exists in RouterOS SSH login processing.

CERT Polska found that specially constructed usernames beginning with a prohibited character could manipulate the trusted RouterOS policy mask. The resulting session could receive full administrative privileges.

CVE-2026-67277 affects the RouterOS bandwidth-test service.

RouterOS could accept a related connection before the primary session had authenticated. Combined with additional validation problems, an unauthenticated client could cause disclosure of uninitialized kernel packet-buffer data or trigger a system restart.

These are distinct vulnerabilities and should not be conflated.

## Technical Analysis

### CVE-2026-86060

The SSH issue is fundamentally a privilege-boundary failure.

RouterOS mishandled a crafted username during login processing. CERT Polska reports that the resulting session could obtain full administrative RouterOS privileges.

The key offensive-security lesson is that authentication code is not simply about checking passwords.

Login processing also transforms usernames, initializes session state, assigns policy masks and establishes privileges.

A flaw anywhere in that sequence can undermine the entire authentication boundary.

### CVE-2026-67277

The bandwidth-test vulnerability demonstrates a different class of state-management failure.

A secondary connection could reach functionality before the primary session had completed authentication.

That created access to functionality that should have existed only after successful login.

CERT Polska describes two resulting consequences: leakage of uninitialized kernel memory and an integer-underflow condition capable of producing abnormal fragmented output and restarting RouterOS.

## Observed Exploitation

This disclosure contains something defenders rarely get: useful evidence from actual attacks.

CERT Polska confirmed exploitation against RouterOS systems exposing SSH to the internet.

Observed log artifacts included failed login activity involving the special crafted username state followed by creation of an unauthorized user.

Researchers also identified a highly privileged account named `ops` in observed compromises.

CERT Polska cautions that absence of these artifacts does **not** prove that a device was never compromised.

That is an important distinction.

An IOC identifies evidence that may indicate compromise. It does not define every possible manifestation of the attack.

## Attacker's Perspective

Why compromise the router instead of a workstation?

Because the router already has what the attacker wants: position.

A router can sit between:

- the internet and internal networks;
- branch locations and headquarters;
- users and cloud services;
- management networks and production infrastructure.

It may also operate without the endpoint security controls defenders rely upon elsewhere.

That changes the economics of compromise.

### Conceptual Attack Path

Internet  
↓  
RouterOS SSH exposed  
↓  
Authentication/privilege flaw  
↓  
Administrative RouterOS access  
↓  
Configuration manipulation  
↓  
Persistent router foothold  
↓  
Network observation or tunneling opportunities  
↓  
Potential access toward internal systems

CERT Polska confirms the exploitation and administrative takeover portions of this chain. Subsequent actions are conceptual possibilities rather than claims about every observed incident.

## Defender Detection

MikroTik added a **Flagged** mechanism that checks configuration for known signs of unauthorized modification.

A critical `Flagged` log entry should be treated as evidence of potential prior compromise.

Administrators should also inspect:

- unknown users;
- scripts;
- scheduler tasks;
- proxy configuration;
- tunnels;
- unexpected management access;
- SSH exposure.

The `ops` account documented by CERT Polska deserves immediate investigation when present.

## Mitigation

Upgrade immediately to a fixed release:

- 6.49.21;
- 7.23.4;
- 7.24.2;
- or a later supported version containing the fixes.

The releases above address the vulnerabilities discussed here. For the related signature-validation flaw CVE-2026-67278, CERT Polska reports that the initial 7.x fixes were incomplete and identifies 7.23.6 and 7.24.3 as corrected releases. Select a supported release that covers all applicable advisories.

MikroTik also recommends not exposing SSH to untrusted networks. Management should instead be restricted to trusted networks or accessed through a VPN such as WireGuard.

After patching, inspect configuration for unauthorized changes.

A router that shows evidence of compromise should be treated as compromised—not merely patched and returned to service without investigation.

## Broader Security Lesson

Endpoint-centric security has a blind spot.

Some of the most useful systems for an attacker are not endpoints at all.

Routers, VPN concentrators, firewalls, access gateways and management appliances can provide privileged network position while offering substantially less endpoint telemetry.

For penetration testers, this means infrastructure enumeration should continue after the obvious servers have been identified.

For defenders, it means asset inventory cannot stop at laptops and servers.

## Key Takeaways

- CERT Polska confirmed real-world attacks against exposed RouterOS systems.
- CVE-2026-86060 can lead to full administrative RouterOS privileges.
- CVE-2026-67277 separately enables kernel-memory leakage or remote DoS.
- MikroTik has released fixed RouterOS versions.
- Publicly exposed management protocols dramatically increase risk.
- Routers should be treated as high-value computing platforms, not invisible plumbing.

## References

- MikroTik — _September 2026 vulnerability_. [MikroTik Security Advisory](https://mikrotik.com/supportsec/september-2026-vulnerability/)
- CERT Polska — _Critical vulnerabilities in MikroTik RouterOS are being actively exploited_. [CERT Polska Exploitation Analysis](https://cert.pl/en/posts/2026/09/vulnerabilities-in-mikrotik-routeros-actively-exploited/)
- CERT Polska — _Vulnerabilities in MikroTik RouterOS software_. [CERT Polska Technical Details](https://cert.pl/en/posts/2026/09/mikrotik-routeros-cve/)

## Red Brixen Research Notes

**Research Confidence:** High  
**Confirmed Exploitation:** Yes — specifically the documented MikroTrick attack chain  
**Public PoC:** Reverse-engineering material exists; exploit code is not reproduced here  
**CISA KEV:** Yes for relevant actively exploited RouterOS vulnerabilities  
**Primary Sources Consulted:** MikroTik, CERT Polska, CISA-derived CVE/KEV records  
**Last Verified:** September 25, 2026
