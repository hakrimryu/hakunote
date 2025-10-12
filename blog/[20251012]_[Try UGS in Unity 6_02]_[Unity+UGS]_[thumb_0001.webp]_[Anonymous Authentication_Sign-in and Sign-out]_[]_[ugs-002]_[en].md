# 🧩 2. Anonymous Authentication – Sign-in and Sign-out

In this article we will walk through the **Anonymous Login** workflow, the most fundamental Authentication feature provided by **Unity Gaming Services (UGS)**.

&nbsp;

## 🔧 Install the Authentication Package

![](img/post_001.png)

Open the **Package Manager** and install the `Authentication` package.  
If you switch to the **Services** tab inside the Package Manager you can view the entire collection of UGS-related packages at a glance.

&nbsp;

![](img/post_002.png)

Once the installation is complete, a **Configure** button appears next to `Install`.  
Select it to move to **Project Settings → Authentication**.

All UGS services you have added are listed under **Services** on the left. The list expands automatically whenever you register a new service.

&nbsp;

![](img/post_003.png)

On the Project Settings screen you can verify the following information:

* **Project Name**
* **Unity Organization**
* **Unity Project ID**

At the bottom, the **Members** section lets you invite collaborators, and the **Will this app be targeted to children…** option determines whether the app is aimed at players under 13.

> If you did not enable Unity Cloud when creating the project,  
> make sure to complete the connection manually through the **Services** tab.

&nbsp;

## 🎨 UI Layout

![](img/post_004.png)

The Authentication UI is composed of the following elements:

| Component                       | Purpose                              |
| :----------------------------- | :----------------------------------- |
| **Login / Logout Button**      | Triggers sign-in and sign-out        |
| **Player Name Input Field**    | Displays and edits the player name   |
| **Save PlayerName Button**     | Persists the player name             |
| **Delete Account Button**      | Deletes the player account           |

&nbsp;

## ⚙️ Create the UGS Initialization Code

Start by preparing the base class **AuthBase.cs** to initialize UGS and bind events.  
Because UGS performs network requests, it is important to structure the code with **async** methods.

```csharp
using Unity.Services.Core;
using UnityEngine;

public class AuthBase : MonoBehaviour
{
    public virtual async void Awake()
    {
        // Log UGS initialization status
        UnityServices.Initialized += () => Debug.Log("UGS Initialized");
        UnityServices.InitializeFailed += ctx => Debug.Log($"UGS Initialize Failed: {ctx.Message}");

        // Initialize UGS
        await UnityServices.InitializeAsync();
    }
}
```

&nbsp;

Next, create **AuthAnonymous.cs** that derives from the base class.

```csharp
public class AuthAnonymous : AuthBase
{
    public override void Awake()
    {
        base.Awake();
    }
}
```

![](img/post_005.png)

Add an empty `AuthManager` object to the scene, attach the **AuthAnonymous** script, and press Play.

If the **Console** displays the message below, the initialization is working correctly.

```
UGS Initialized
```

&nbsp;

## 🔑 Implement Anonymous Login

Anonymous sign-in uses `AuthenticationService.Instance.SignInAnonymouslyAsync()`.  
Bind it to the login button so the async sign-in flow runs whenever the user clicks the button.

```csharp
using System.Threading.Tasks;
using TMPro;
using Unity.Services.Authentication;
using UnityEngine;
using UnityEngine.UI;

public class AuthAnonymous : AuthBase
{
    [Header("UI Components")]
    [SerializeField] private Button loginButton;
    [SerializeField] private Button logoutButton;
    [SerializeField] private Button savePlayerButton;
    [SerializeField] private Button deletePlayerButton;
    [SerializeField] private TMP_InputField playerNameInputField;

    public override void Awake()
    {
        base.Awake();
        BindingUIEvents();
    }

    /// <summary>
    /// Bind UI events
    /// </summary>
    private void BindingUIEvents()
    {
        loginButton.onClick.AddListener(async () => await Login());
    }

    /// <summary>
    /// Anonymous login
    /// </summary>
    private async Task Login()
    {
        await AuthenticationService.Instance.SignInAnonymouslyAsync();
        Debug.Log("Login success");
    }
}
```

> `AuthenticationService` supports Apple, Google, Facebook, and many other providers.  
> In this walkthrough we focus exclusively on **SignInAnonymouslyAsync**.

&nbsp;

![](img/post_006.png)

Once the UI wiring is complete, running the scene prints the following messages in the console.

```
UGS Initialized
Login success
```

&nbsp;

## 📡 Handle Sign-in Events and Add Sign-out

`AuthenticationService` exposes multiple events for sign-in and sign-out.  
Extend **AuthBase.cs** so we can subscribe to them.

```csharp
using Unity.Services.Authentication;
using Unity.Services.Core;
using UnityEngine;

public class AuthBase : MonoBehaviour
{
    public virtual async void Awake()
    {
        // Callback to confirm that UGS finished initializing
        UnityServices.Initialized += () => Debug.Log("UGS Initialized");
        UnityServices.InitializeFailed += ctx => Debug.Log($"UGS Initialize Failed: {ctx.Message}");

        // Initialize UGS
        await UnityServices.InitializeAsync();

        BindingUgsEvents();
    }

    /// <summary>
    /// Bind UGS events
    /// </summary>
    public virtual void BindingUgsEvents()
    {
        // Sign-in event
        AuthenticationService.Instance.SignedIn += async () =>
        {
            Debug.Log("Login success");
            Debug.Log($"Player ID : {AuthenticationService.Instance.PlayerId}");

            // PlayerName only has a value if it was cached previously; otherwise it returns empty
            Debug.Log($"Player Name : {AuthenticationService.Instance.PlayerName}");

            // GetPlayerNameAsync fetches the value directly from the server
            // Anonymous sign-in generates a random name
            var playerName = await AuthenticationService.Instance.GetPlayerNameAsync();
            Debug.Log($"Player Name : {playerName}");

            // AccessToken is used internally to confirm authentication status for other UGS services
            Debug.Log($"Player AccessToken : {AuthenticationService.Instance.AccessToken}");
        };

        // Sign-out event
        AuthenticationService.Instance.SignedOut += () => Debug.Log("Logout success");

        // UGS maintains session timing internally, so check whether it expired
        AuthenticationService.Instance.Expired += () => Debug.Log("session expired");
    }
}
```

Now update **AuthAnonymous.cs** as shown below.

```csharp
using System.Threading.Tasks;
using TMPro;
using Unity.Services.Authentication;
using UnityEngine;
using UnityEngine.UI;

public class AuthAnonymous : AuthBase
{
    [Header("UI Components")]
    [SerializeField] private Button loginButton;
    [SerializeField] private Button logoutButton;
    [SerializeField] private Button savePlayerButton;
    [SerializeField] private Button deletePlayerButton;
    [SerializeField] private TMP_InputField playerNameInputField;

    public override void Awake()
    {
        base.Awake();
        BindingUIEvents();
    }

    /// <summary>
    /// Bind UI events
    /// </summary>
    private void BindingUIEvents()
    {
        loginButton.onClick.AddListener(async () => await Login());
        logoutButton.onClick.AddListener(Logout);
    }

    /// <summary>
    /// Anonymous login
    /// </summary>
    private async Task Login()
    {
        try
        {
            await AuthenticationService.Instance.SignInAnonymouslyAsync();

            // Duplicate names may include a #xxxx suffix, so strip everything after '#'
            var playerName = await AuthenticationService.Instance.GetPlayerNameAsync();
            playerNameInputField.text = playerName.Split('#')[0];
        }
        catch (AuthenticationException e)
        {
            Debug.Log(e.Message);
        }
    }

    /// <summary>
    /// Sign out
    /// </summary>
    private void Logout()
    {
        AuthenticationService.Instance.SignOut();
    }
}
```

> `Logout()` is not asynchronous, so there is no need to mark it as `async`.  
> Use `AuthenticationException` to safely handle any errors during sign-in.

&nbsp;

## ✅ Result

![](img/post_008.png)

After signing in, the input field correctly displays the **Player Name**.

&nbsp;

![](img/post_009.png)

The Console confirms that sign-in/sign-out and player information lookups are all functioning as expected.

