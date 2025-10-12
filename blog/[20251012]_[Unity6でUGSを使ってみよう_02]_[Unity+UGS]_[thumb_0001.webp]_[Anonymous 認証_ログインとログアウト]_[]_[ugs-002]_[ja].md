# 🧩 2. Anonymous 認証 - ログインとログアウト

今回は **Unity Gaming Services(UGS)** の Authentication 機能のうち、もっとも基本となる **匿名ログイン(Anonymous Login)** を扱います。

&nbsp;

## 🔧 Authentication パッケージの導入

![](img/post_001.png)

まずは **パッケージマネージャー(Package Manager)** から `Authentication` パッケージをインストールします。  
パッケージマネージャーの **Services タブ** に移動すると、UGS 関連のパッケージを一覧で確認できます。

&nbsp;

![](img/post_002.png)

インストールが終わると `Install` の横に **Configure** ボタンが表示されます。  
クリックすると **Project Settings → Authentication** の画面に移動します。

左側の **Services** 欄には導入済みの UGS サービスが並び、新しいサービスを追加するたびに自動でリストが拡張されます。

&nbsp;

![](img/post_003.png)

プロジェクト設定では次の項目を確認できます。

* **Project Name**
* **Unity Organization**
* **Unity Project ID**

下部の **Members** ではメンバー招待が可能で、  
**Will this app be targeted to children…** では 13 歳以下を対象とするかどうかを設定します。

> プロジェクト作成時に Unity Cloud を有効化していない場合は、  
> **Services タブ** から手動で接続を完了させましょう。

&nbsp;

## 🎨 UI 構成

![](img/post_004.png)

Authentication 用の UI は次の構成になっています。

| 構成要素                     | 説明                     |
| :----------------------- | :----------------------- |
| **Login / Logout ボタン** | ログイン/ログアウトのトリガー |
| **Player Name 入力フィールド** | プレイヤー名の表示と編集       |
| **Save PlayerName ボタン** | プレイヤー名の保存            |
| **Delete Account ボタン** | アカウント削除                |

&nbsp;

## ⚙️ UGS 初期化コードの作成

UGS の初期化とイベントバインドを行う基底クラス **AuthBase.cs** を用意します。  
UGS はネットワークリクエストを扱うため、**非同期(Async)** で構成することが重要です。

```csharp
using Unity.Services.Core;
using UnityEngine;

public class AuthBase : MonoBehaviour
{
    public virtual async void Awake()
    {
        // UGS 初期化状態をログに出力
        UnityServices.Initialized += () => Debug.Log("UGS Initialized");
        UnityServices.InitializeFailed += ctx => Debug.Log($"UGS Initialize Failed: {ctx.Message}");

        // UGS を初期化
        await UnityServices.InitializeAsync();
    }
}
```

&nbsp;

続いて、これを継承する **AuthAnonymous.cs** を作成します。

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

シーン内に `AuthManager` という空のオブジェクトを作り、  
**AuthAnonymous** スクリプトをアタッチして実行します。

**Console** ウィンドウに次のメッセージが表示されれば初期化成功です。

```
UGS Initialized
```

&nbsp;

## 🔑 匿名ログインの実装

匿名ログインには `AuthenticationService.Instance.SignInAnonymouslyAsync()` を使用します。  
UI イベントに紐付け、ログインボタンが押されたときに非同期でログイン処理を呼び出します。

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
    /// UI イベントのバインド
    /// </summary>
    private void BindingUIEvents()
    {
        loginButton.onClick.AddListener(async () => await Login());
    }

    /// <summary>
    /// 匿名ログイン
    /// </summary>
    private async Task Login()
    {
        await AuthenticationService.Instance.SignInAnonymouslyAsync();
        Debug.Log("Login success");
    }
}
```

> `AuthenticationService` には Apple や Google、Facebook などのログイン方式も用意されています。  
> 今回はその中から **匿名ログイン(SignInAnonymouslyAsync)** のみを利用します。

&nbsp;

![](img/post_006.png)

UI を紐付けて実行すると、コンソールに次のメッセージが表示されます。

```
UGS Initialized
Login success
```

&nbsp;

## 📡 ログインイベント処理とログアウトの追加

`AuthenticationService` はログイン/ログアウト時のイベントを複数提供しています。  
これらを扱えるように **AuthBase.cs** を拡張します。

```csharp
using Unity.Services.Authentication;
using Unity.Services.Core;
using UnityEngine;

public class AuthBase : MonoBehaviour
{
    public virtual async void Awake()
    {
        // UGS が初期化済みかを確認するコールバック
        UnityServices.Initialized += () => Debug.Log("UGS Initialized");
        UnityServices.InitializeFailed += ctx => Debug.Log($"UGS Initialize Failed: {ctx.Message}");

        // UGS を初期化
        await UnityServices.InitializeAsync();

        BindingUgsEvents();
    }

    /// <summary>
    /// UGS イベントのバインド
    /// </summary>
    public virtual void BindingUgsEvents()
    {
        // ログインイベント
        AuthenticationService.Instance.SignedIn += async () =>
        {
            Debug.Log("Login success");
            Debug.Log($"Player ID : {AuthenticationService.Instance.PlayerId}");

            // PlayerName はキャッシュに一度保存されていれば値が入り、なければ空文字になる
            Debug.Log($"Player Name : {AuthenticationService.Instance.PlayerName}");

            // GetPlayerNameAsync はサーバーから直接取得する
            // 匿名ログインの場合はランダムな名前が付与される
            var playerName = await AuthenticationService.Instance.GetPlayerNameAsync();
            Debug.Log($"Player Name : {playerName}");

            // UGS の他サービス利用時に内部で認証済みかを判断するためのトークン
            Debug.Log($"Player AccessToken : {AuthenticationService.Instance.AccessToken}");
        };

        // ログアウトイベント
        AuthenticationService.Instance.SignedOut += () => Debug.Log("Logout success");

        // 一定時間でセッションが切れるため、タイムアウトしたかどうかを検知
        AuthenticationService.Instance.Expired += () => Debug.Log("session expired");
    }
}
```

次に **AuthAnonymous.cs** を下記のように更新します。

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
    /// UI イベントのバインド
    /// </summary>
    private void BindingUIEvents()
    {
        loginButton.onClick.AddListener(async () => await Login());
        logoutButton.onClick.AddListener(Logout);
    }

    /// <summary>
    /// 匿名ログイン
    /// </summary>
    private async Task Login()
    {
        try
        {
            await AuthenticationService.Instance.SignInAnonymouslyAsync();

            // GetPlayerNameAsync で重複名があると #xxxx が付くため # 以降を表示しない
            var playerName = await AuthenticationService.Instance.GetPlayerNameAsync();
            playerNameInputField.text = playerName.Split('#')[0];
        }
        catch (AuthenticationException e)
        {
            Debug.Log(e.Message);
        }
    }

    /// <summary>
    /// ログアウト
    /// </summary>
    private void Logout()
    {
        AuthenticationService.Instance.SignOut();
    }
}
```

> `Logout()` は非同期処理ではないため `async` を付与する必要はありません。  
> `AuthenticationException` を使って、ログイン中の例外を安全にハンドリングします。

&nbsp;

## ✅ 実行結果

![](img/post_008.png)

ログイン後、入力フィールドに **Player Name** が正常に表示されます。

&nbsp;

![](img/post_009.png)

Console でもログイン/ログアウトとプレイヤー情報の取得が問題なく動作していることが確認できます。

