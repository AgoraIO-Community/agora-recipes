# Voice-controlled Game NPC

Conversational NPCs for Unity and Unreal.

## Features

- Per-NPC personality, voice, and tool list.
- Push-to-talk or always-on voice activity detection.
- Function calling so NPCs can give items, open doors, or trigger quests.
- Uses Agora SD-RTN on constrained networks.

## Unity quick start

```csharp
var npc = gameObject.AddComponent<AgoraVoiceNPC>();
npc.persona = "A grumpy blacksmith named Doran";
npc.tools = new[] { Tools.GiveItem, Tools.OpenShop };
npc.Begin();
```

## Unreal quick start

Drop the **AgoraVoiceNPCComponent** onto a Pawn and configure the persona
and tools in the Details panel.
