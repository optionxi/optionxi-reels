# How I Created My Own Animated Avatar for Reels

I wanted to create a cartoon version of myself that I could use in my videos and Reels. Instead of using a static image every time, I wanted a character that could move, talk, wave and point.

Here's how I made it.

## Step 1: Create My Cartoon Avatar Using ChatGPT

First, I uploaded:
- A reference image showing the cartoon style I liked.
- My own photographs so the character would look like me.

I asked ChatGPT to create a cartoon version of me, keeping the same illustration style and standing pose as the reference.

**Output:** A cartoon image of myself.

## Step 2: Make the Character Move Using Claude

Next, I gave this image to Claude and asked it to turn the character into an interactive HTML version.

Basically, I wanted to make different parts of my character move independently.

For example:
- Move the hands.
- Bend the arms.
- Wave.
- Point upwards.
- Make natural movements while talking.

Claude created a version with buttons that allowed me to try different poses and movements.

I checked how the character looked and adjusted it until I was happy with the appearance and movements.

## Step 3: Convert It into a React File

Once I was happy with the character, I asked Claude to convert it into a React + TypeScript file called `Avatar.tsx`.

Think of this as converting the working character into a format that can be reused in other projects.

The character and its movements were preserved.

## Step 4: Make It Ready for Video Creation

Finally, I asked Claude to convert the character into a Remotion-compatible file called `AvatarRig.tsx`.

This was an important step.

I wanted to use the character directly while creating videos and Reels, without needing to click buttons every time.

So Claude:
- Removed the buttons.
- Removed the interactive controls.
- Made the character move based on a video timeline.
- Added natural idle movements, like gentle body and head movement.
- Made it possible to decide exactly when the character should wave, talk or point.

For example, I can tell the character:

- At the beginning: Stand normally.
- After 2 seconds: Wave.
- After 4 seconds: Talk.
- After 6 seconds: Point upwards.

The movements happen automatically when the video is rendered.

## Final Result

I now have a reusable animated version of myself that I can use in different videos and Reels.

I don't need to create the character again every time. I can simply reuse the same file and decide what movements I want in each video.

---

## The Entire Process at a Glance

1. **ChatGPT** – Create a cartoon version of myself.
2. **Claude** – Turn the cartoon into a moving character and test different poses.
3. **Claude** – Convert it into a reusable React file.
4. **Claude + Remotion** – Turn it into an animation rig that can be controlled through a video timeline.
5. **Remotion** – Use the character in my videos and Reels.

**In simple terms: I created my cartoon self, taught it how to move, and turned it into a reusable character for making videos.**