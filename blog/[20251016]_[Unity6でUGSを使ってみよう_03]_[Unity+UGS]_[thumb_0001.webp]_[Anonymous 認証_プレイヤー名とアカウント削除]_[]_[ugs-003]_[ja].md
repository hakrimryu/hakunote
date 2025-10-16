# 🧩 3. Anonymous 認証 - プレイヤー名とアカウント削除

今回は **Unity Gaming Services(UGS)** の Authentication 機能のうち、**プレイヤー名の変更**と**アカウント削除**について紹介します。前回の記事で作成した **AuthAnonymous** スクリプトを引き続き使用します。

&nbsp;

## 🧱 プレイヤー名の変更

プレイヤー名の変更も `AuthAnonymous` クラス内で実装を進めます。`UpdatePlayerNameAsync` 関数でサーバーに名前を保存し、`GetPlayerNameAsync` 関数で保存済みの名前を再取得できます。

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
    /// UIイベントのバインド
    /// </summary>
    private void BindingUIEvents()
    {
        ...
        savePlayerNameButton.onClick.AddListener(async () => await SavePlayerName(playerNameInputField.text));
    }

    ...

    /// <summary>
    /// ログアウト
    /// </summary>
    private void Logout()
    {
        AuthenticationService.Instance.SignOut();
        playerNameInputField.text = "";
    }

    /// <summary>
    /// プレイヤー名の保存
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

名前変更を確認できるように **Logout()** 関数で入力フィールドを初期化し、実際に名前を更新する **SavePlayerName()** 関数を定義したあと、`BindingUIEvents()` で `savePlayerNameButton` の処理を追加しました。

&nbsp;

![](img/post_010.png)
![](img/post_011.png)

実行後、**Login** 状態で `InputField` に変更したい名前を入力し、**Save PlayerName** ボタンをクリックするとサーバーに保存されます。その後 **Logout** してから再び **Login** すると、変更された **Player Name** を確認できます。

&nbsp;

## 🧱 プレイヤーアカウントの削除

アカウント削除もとても簡単です。`AuthenticationService.Instance.DeleteAccountAsync()` を呼び出すだけで、現在ログイン中のプレイヤーアカウントを削除できます。

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
    /// UIイベントのバインド
    /// </summary>
    private void BindingUIEvents()
    {
        ...
        deletePlayerButton.onClick.AddListener(async () => await DeletePlayer());
    }

    ...

    /// <summary>
    /// プレイヤーアカウントを削除
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

Login 後に **Delete Account** ボタンをクリックすると、ログにメッセージが表示され、アカウントが削除されたことを確認できます。

&nbsp;

![](img/post_013.png)
再度 Login すると、まったく別の **新しいアカウント** でログインされます。

&nbsp;

![](img/post_014.png)

この状態で **UGS ダッシュボード** を確認すると、**Player Management** に以前のアカウントが存在せず、直近で作成された 1 件のみが残っていることがわかります。また、この画面からプレイヤーのログイン方法、通貨、Cloud Save などの情報も確認可能です。

> ウェブブラウザで直接アクセスするか、**Project Settings > Services > Authentication > Go to Dashboard** から移動できます

&nbsp; 

これで **Anonymous Login（匿名ログイン）** の実装は完了です。
