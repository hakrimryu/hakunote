# 🧩 3. Anonymous 인증 - 플레이어 닉네임 및 어카운트 삭제

이번 글에서는 **Unity Gaming Services(UGS)** 의 Authentication 기능 중 **플레이어 이름 변경**과 **어카운트 삭제**를 다룹니다.
이전 글에서 만든 **AuthAnonymous** 스크립트를 계속 사용합니다.

&nbsp;

## 🧱 플레이어 이름 변경

플레이어 이름 변경은 `AuthAnonymous` 클래스 내에서 계속 구현 하겠습니다.
`UpdatePlayerNameAsync` 함수를 통해 서버에 이름을 저장하고, `GetPlayerNameAsync` 함수로 저장된 이름을 다시 불러올 수 있습니다.

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
    /// UI 이벤트 바인딩
    /// </summary>
    private void BindingUIEvents()
    {
        ...
        savePlayerNameButton.onClick.AddListener(async () => await SavePlayerName(playerNameInputField.text));
    }

    ...

    /// <summary>
    /// 로그아웃
    /// </summary>
    private void Logout()
    {
        AuthenticationService.Instance.SignOut();
        playerNameInputField.text = "";
    }

    /// <summary>
    /// 플레이어 이름 저장
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

이름 변경을 확인하기 위해 **Logout()** 함수에서 입력 필드를 초기화하고, 실제 이름을 변경하는 **SavePlayerName()** 함수를 작성한 후 `BindingUIEvents()`에서 `savePlayerNameButton`을 추가했습니다.

&nbsp;

![](img/post_010.png)
![](img/post_011.png)

실행 후 **Login** 상태에서 `InputField`에 변경 할 이름을 입력하고 **Save PlayerName** 버튼을 클릭하면 서버에 저장됩니다.
이후 **Logout** 후 다시 **Login** 하면 변경된 **Player Name**을 확인할 수 있습니다.

&nbsp;

## 🧱 플레이어 어카운트 삭제

어카운트 삭제 또한 매우 간단합니다.
`AuthenticationService.Instance.DeleteAccountAsync()`를 호출하면 현재 로그인 중인 플레이어의 계정을 삭제할 수 있습니다.

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
    /// UI 이벤트 바인딩
    /// </summary>
    private void BindingUIEvents()
    {
        ...
        deletePlayerButton.onClick.AddListener(async () => await DeletePlayer());
    }

    ...

    /// <summary>
    /// 플레이어 어카운트 삭제
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

Login 후 **Delete Account** 버튼을 클릭하면 Log와 함께 어카운트가 삭제된 것을 확인할 수 있습니다.

&nbsp;

![](img/post_013.png)
다시 Login 하면 전혀 다른 **새 어카운트**로 로그인됩니다.

&nbsp;

![](img/post_014.png)

이때 **UGS 대시보드**로 이동해 보면, **Player Management**에서 기존 어카운트가 삭제되고 최근 생성된 하나의 어카운트만 존재하는 것을 확인할 수 있습니다.  
또한 이 화면에서 해당 플레이어의 로그인 방식, 재화, Cloud Save 등의 정보도 확인할 수 있습니다.

> 웹브라우저에서 직접 이동하거나 **Project Settings > Services > Authentication > Go to Dashboard**를 통해 이동

&nbsp; 

여기까지 **익명 로그인(Anonymous Login)** 의 구현을 마쳤습니다.
