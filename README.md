# Download/Installation
Click the green "Code" button then "Download ZIP" to download. Make sure you extract the ZIP before proceeding.
<br>![image](https://github.com/user-attachments/assets/b2f29210-d2ee-4cfc-b8d8-5225a83b5cbb)

To install the extension, go to chrome://extensions and turn developer mode on in the top right corner. Then. click "Load unpacked" and select the folder with the extension.
<br>![image](https://github.com/user-attachments/assets/e4378cfa-9220-4187-8c51-76f0ddda1995)
**NOTE:** The folder will be 2 layers deep because of how Github exports the files (something like `C:\Users\Username\Downloads\dashcraft-track-importer-main\dashcraft-track-importer-main`).

Then, click the puzzle piece icon icon at the top right and pin the extension.
<br>![image](https://github.com/user-attachments/assets/dd16e018-2998-4a12-8de7-aaa81e6097eb)

# Using the extension
To start, open DashCraft and click on the extension icon. There will be a few different buttons which all lead to seperate tools:

## Account Switcher
Whenever you are signed in to an account, your account token will automatically be saved. Then, you can sign in to them by clicking the buttons in this menu.
<br>You can delete accounts by clicking on the right side of the sign in button.
<br><br>**IMPORTANT NOTE**: While an account token can let anybody sign in to your account, this extension only stores them on your computer and not on any servers. Tokens aren't very secure anyways (running any bookmarklet or extension while on DashCraft can let somebody steal it), so having it stored in the extension doesn't sacrifice any security.

## Track Importer
Upon opening the track importer, you'll see 3 input sections:
- The first box is the track. You can either put in a track link or JSON data of the track pieces. Once you put in the link or JSON, it'll automatically load the track.
- The extension also allows you to move the track around. This allows you to reposition the track vertically, off-grid, or outside of the stadium. Keep in mind that 15 units here is equal to 1 unit in game.
- Finally, you can also rotate the track. DashCraft stores rotations in degrees, so you're able to have rotations that are impossible to achieve in-game. However, rotations that aren't in 90 degree increments will cause the pieces to be slightly misaligned because the game automatically rounds piece positions.
<!---->
After changing the settings, follow the instructions given at the bottom. It'll work on any track with the correct number of pieces.

## Copy Detector
This is a very simple tool that checks if a track has been copied or has illegal piece placements. Just put a link in and it'll tell you.
