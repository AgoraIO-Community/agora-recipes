# Voice-controlled Game NPC

Plug-and-play conversational NPCs for Unity and Unreal.

## Features

- Per-NPC personality, voice, and tool list.
- Push-to-talk or always-on voice activity detection.
- Function calling so NPCs can give items, open doors, or trigger quests.
- Falls back gracefully on poor networks via Agora's global SD-RTN.

## Unity quick start

```csharp
var npc = gameObject.AddComponent<AgoraVoiceNPC>();
npc.persona = "A grumpy blacksmith named Doran";
npc.tools = new[] { Tools.GiveItem, Tools.OpenShop };
npc.Begin();
```

## Unreal quick start

Drop the **AgoraVoiceNPCComponent** onto any Pawn and configure the persona
and tools in the Details panel.
