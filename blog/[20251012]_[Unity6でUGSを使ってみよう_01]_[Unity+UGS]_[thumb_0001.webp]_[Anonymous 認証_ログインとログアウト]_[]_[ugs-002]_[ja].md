# 🧩 2. Anonymous 인증 - 로그인과 로그아웃

이번 글에서는 **Unity Gaming Services(UGS)** 의 Authentication 기능 중 가장 기본이 되는 **익명 로그인(Anonymous Login)** 방식을 다룹니다.

&nbsp;

## 🔧 Authentication 패키지 설치

![](img/post_001.png)

먼저 **패키지 매니저(Package Manager)** 에서 `Authentication` 패키지를 설치합니다.  
패키지 매니저의 **Services 탭** 으로 이동하면 UGS 관련 패키지들을 한눈에 확인할 수 있습니다.

&nbsp;

![](img/post_002.png)

설치가 완료되면 `Install` 버튼 옆에 **Configure** 버튼이 생깁니다.
이를 클릭하면 **Project Settings → Authentication** 화면으로 이동합니다.  

왼쪽 **Services** 항목 아래에는 설치된 UGS 서비스 목록이 표시되며, 새로운 서비스를 추가할 때마다 자동으로 목록이 확장됩니다.  

&nbsp;

![](img/post_003.png)

프로젝트 설정 화면에서는 다음 항목들을 확인할 수 있습니다.

* **Project Name**
* **Unity Organization**
* **Unity Project ID**

하단의 **Members** 에서는 프로젝트 멤버를 초대할 수 있으며,
**Will this app be targeted to children…** 옵션은
앱이 13세 이하 아동을 대상으로 하는지 여부를 설정합니다.

> 프로젝트 생성 시 Unity Cloud를 활성화하지 않았다면,
> **Service 탭**에서 직접 연결 과정을 진행해야 합니다.

&nbsp;

## 🎨 UI 구성

![](img/post_004.png)

Authentication UI는 아래 구성으로 준비되어 있습니다.

| 구성 요소                  | 설명              |
| :--------------------- | :-------------- |
| **Login / Logout 버튼**  | 로그인, 로그아웃 트리거   |
| **Player Name 입력 필드**  | 플레이어 이름 표시 및 수정 |
| **Save PlayerName 버튼** | 플레이어 이름 저장      |
| **Delete Account 버튼**  | 계정 삭제           |

&nbsp;

## ⚙️ UGS 초기화 코드 작성

UGS 초기화 및 이벤트 바인딩을 위한 기본 클래스 **AuthBase.cs**를 작성합니다.
UGS는 네트워크 요청을 처리하므로 **비동기(Async)** 방식으로 구성하는 것이 중요합니다.

```csharp
using Unity.Services.Core;  
using UnityEngine;  

public class AuthBase : MonoBehaviour  
{  
    public virtual async void Awake()  
    {  
        // UGS 초기화 상태 로그 출력  
        UnityServices.Initialized += () => Debug.Log("UGS Initialized");  
        UnityServices.InitializeFailed += ctx => Debug.Log($"UGS Initialize Failed: {ctx.Message}");  
        
        // UGS 초기화  
        await UnityServices.InitializeAsync();  
    }  
}  
```

&nbsp;

이제 이를 상속받는 **AuthAnonymous.cs**를 작성합니다.

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

씬(Scene)에 `AuthManager`라는 빈 오브젝트를 생성하고
**AuthAnonymous** 스크립트를 추가한 뒤 실행합니다.

**Console** 창에 아래 메시지가 출력되면 성공적으로 초기화된 것입니다.

```
UGS Initialized
```

&nbsp;

## 🔑 익명 로그인 구현

익명 로그인은 `AuthenticationService.Instance.SignInAnonymouslyAsync()`를 이용합니다.
UI 이벤트를 통해 로그인 버튼을 눌렀을 때 비동기 로그인을 수행하도록 구현합니다.

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
    /// UI 이벤트 바인딩  
    /// </summary>  
    private void BindingUIEvents()  
    {  
        loginButton.onClick.AddListener(async () => await Login());  
    }  

    /// <summary>  
    /// 익명 로그인  
    /// </summary>  
    private async Task Login()  
    {  
        await AuthenticationService.Instance.SignInAnonymouslyAsync();  
        Debug.Log("Login success");  
    }  
}  
```

> `AuthenticationService`에는 Apple, Google, Facebook 등 다양한 로그인 방식이 있습니다.  
> 이번에는 그중 **익명 로그인(SignInAnonymouslyAsync)** 기능만 사용했습니다.

&nbsp;

![](img/post_006.png)

UI 연결 후 실행하면 콘솔에 다음 메시지가 표시됩니다.

```
UGS Initialized
Login success
```

&nbsp;

## 📡 로그인 이벤트 처리 및 로그아웃 추가

`AuthenticationService`는 로그인과 로그아웃 시 여러 이벤트를 제공합니다.
이벤트를 처리하기 위해 **AuthBase.cs**를 확장합니다.

```csharp
using Unity.Services.Authentication;
using Unity.Services.Core;
using UnityEngine;

public class AuthBase : MonoBehaviour
{
    public virtual async void Awake()
    {
        // UGS가 초기화되었는지 확인을 위한 콜백
        UnityServices.Initialized += () => Debug.Log("UGS Initialized");
        UnityServices.InitializeFailed += ctx => Debug.Log($"UGS Initialize Failed: {ctx.Message}");
        
        // UGS 초기화
        await UnityServices.InitializeAsync();
        
        BindingUgsEvents();
    }

    /// <summary>
    /// UGS 이벤트 바인딩
    /// </summary>
    public virtual void BindingUgsEvents()
    {
        // 로그인 이벤트
        AuthenticationService.Instance.SignedIn += async () =>
        {
            Debug.Log("Login success");
            Debug.Log($"Player ID : {AuthenticationService.Instance.PlayerId}");
            
            // PlayerName은 캐시에 한번이라고 저장이 되어 있을때만 값이 있고 없다면 빈값이 출력 된다.
            Debug.Log($"Player Name : {AuthenticationService.Instance.PlayerName}");

            // GetPlayerNameAsync는 서버에서 직접 취득 한다.
            // 익명 로그인의 경우 무작위 이름
            var playerName = await AuthenticationService.Instance.GetPlayerNameAsync();
            Debug.Log($"Player Name : {playerName}");
            
            // UGS의 다른 서비스들을 이용 시에 내부적으로 인증이 되었는지를 판단하기 위한 Token
            Debug.Log($"Player AccessToken : {AuthenticationService.Instance.AccessToken}");
        };

        // 로그아웃 이벤트
        AuthenticationService.Instance.SignedOut += () => Debug.Log("Logout success");
        
        // 일정 시간이 지나면 자동으로 세션이 종료되도록 내부적으로 세션 타임을 가지고 있기 때문에 타임아웃이 되었는지 확인
        AuthenticationService.Instance.Expired += () => Debug.Log("session expired");
    }
}
```

이제 **AuthAnonymous.cs**를 아래처럼 수정합니다.


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
    /// UI 이벤트 바인딩
    /// </summary>
    private void BindingUIEvents()
    {
        loginButton.onClick.AddListener(async () => await Login());
        logoutButton.onClick.AddListener(Logout);
    }

    /// <summary>
    /// 익명 로그인
    /// </summary>
    private async Task Login()
    {
        try
        {
            await AuthenticationService.Instance.SignInAnonymouslyAsync();
            
            // GetPlayerNameAsync시 중복된 이름이 여러 개 있으면 #xxxx와 같이 받아 오기 때문에 #부터 출력하지 않는다.
            var playerName = await AuthenticationService.Instance.GetPlayerNameAsync();
            playerNameInputField.text = playerName.Split('#')[0];
        }
        catch (AuthenticationException e)
        {
            Debug.Log(e.Message);
        }
    }

    /// <summary>
    /// 로그아웃
    /// </summary>
    private void Logout()
    {
        AuthenticationService.Instance.SignOut();
    }
}
```

> `Logout()`은 비동기 작업이 아니므로 `async`가 필요하지 않습니다.  
> `AuthenticationException`을 사용해 로그인 중 발생하는 예외를 안전하게 처리합니다.

&nbsp;

## ✅ 실행 결과

![](img/post_008.png)

로그인 후, 입력 필드에 **Player Name**이 정상적으로 표시됩니다.

&nbsp;

![](img/post_009.png)

console에서도 정상적으로 로그인/로그아웃 및 플레이어 정보 확인이 동작하는 것을 확인할 수 있습니다.

