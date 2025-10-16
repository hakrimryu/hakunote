# 🧩 3. Anonymous Authentication - Player Nickname and Account Deletion

In this article we continue exploring **Unity Gaming Services (UGS)** Authentication, focusing on **updating the player nickname** and **deleting the account**. We keep using the **AuthAnonymous** script built in the previous post.

&nbsp;

## 🧱 Updating the Player Nickname

We implement the nickname update inside the same `AuthAnonymous` class. Call `UpdatePlayerNameAsync` to save the name on the server, and `GetPlayerNameAsync` to fetch the stored value again.

```cs
using System.Threading.Tasks;
using TMPro;
using Unity.Services.Authentication;
using UnityEngine;
using UnityEngine.UI;

public class AuthAnonymous : AuthBase
{
    ...

    /// <summary>
    /// Bind UI events
    /// </summary>
    private void BindingUIEvents()
    {
        ...
        savePlayerNameButton.onClick.AddListener(async () => await SavePlayerName(playerNameInputField.text));
    }

    ...

    /// <summary>
    /// Logout
    /// </summary>
    private void Logout()
    {
        AuthenticationService.Instance.SignOut();
        playerNameInputField.text = "";
    }

    /// <summary>
    /// Save player nickname
    /// </summary>
    private async Task SavePlayerName(string playerName)
    {
        try
        {
            await AuthenticationService.Instance.UpdatePlayerNameAsync(playerName);

            var savedName = await AuthenticationService.Instance.GetPlayerNameAsync();
            playerNameInputField.text = savedName.Split('#')[0];
        }
        catch (AuthenticationException e)
        {
            Debug.Log(e.Message);
        }
    }
}
```

To verify the nickname change we clear the input field in **Logout()**, add the actual update logic in **SavePlayerName()**, and register the handler for `savePlayerNameButton` within `BindingUIEvents()`.

&nbsp;

![](img/post_010.png)
![](img/post_011.png)

Run the scene, sign in, type the new nickname into the `InputField`, and click **Save PlayerName** to store it on the server. After hitting **Logout** and signing in again, you can confirm the updated **Player Name**.

&nbsp;

## 🧱 Deleting the Player Account

Deleting the account is just as straightforward. Call `AuthenticationService.Instance.DeleteAccountAsync()` to remove the currently signed-in player.

```cs
using System;
using System.Threading.Tasks;
using TMPro;
using Unity.Services.Authentication;
using UnityEngine;
using UnityEngine.UI;

public class AuthAnonymous : AuthBase
{
    ...

    /// <summary>
    /// Bind UI events
    /// </summary>
    private void BindingUIEvents()
    {
        ...
        deletePlayerButton.onClick.AddListener(async () => await DeletePlayer());
    }

    ...

    /// <summary>
    /// Delete player account
    /// </summary>
    private async Task DeletePlayer()
    {
        try
        {
            await AuthenticationService.Instance.DeleteAccountAsync();
            Debug.Log("Player account deleted");
        }
        catch (AuthenticationException e)
        {
            Debug.Log(e.Message);
        }
    }
}
```

![](img/post_012.png)

After logging in, clicking **Delete Account** prints the log message and confirms that the account has been removed.

&nbsp;

![](img/post_013.png)
When you sign in again, you will be authenticated as a completely **new account**.

&nbsp;

![](img/post_014.png)

Check the **UGS dashboard** and you will see that **Player Management** now lists only the most recently created account. From here you can review the player’s sign-in method, currencies, Cloud Save data, and more.

> Open the page directly in your browser or go via **Project Settings > Services > Authentication > Go to Dashboard**.

&nbsp; 

This wraps up the implementation of **Anonymous Login**.
