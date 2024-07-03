let user_id = window.localStorage.getItem("local_userId");

if (!window.localStorage.getItem("local_userId")) {
  window.location.href = "../Facebook-clone/register/login/login.html";
}

export function leftLinks(obj){
    return (
        `
        <div class="left_items_parent">
            <div class="left_items">
        <div class="cancelMenu" id="cancelMenu">
            <i class="fa-solid fa-circle-xmark"></i>
        </div>
        <a href="${obj.Home}" class="home">
          <div class="text-center d-inline-block">
            <i class="fa-solid fa-house"></i>
          </div>
          Home
        </a>
        <a href="${obj.friends}" class="friends">
          <div class="text-center d-inline-block">
            <i class="fa-solid fa-user-group"></i>
          </div>
          Friends
        </a>
        <a href="${obj.saved}?userId=${user_id}" class="saved">
          <div class="text-center d-inline-block">
            <i class="fa-solid fa-bookmark"></i>
          </div>
          Saved
        </a>
        <a href="${obj.favourite}?userId=${user_id}" class="favourites">
          <div class="text-center d-inline-block">
            <i class="fa-solid fa-star"></i>
          </div>
          Favourites
        </a>
        <a href="#" class="groups">
          <div class="text-center d-inline-block">
            <i class="fa-solid fa-users"></i>
          </div>
          Groups
        </a>
        <a href="#" class="pages">
          <div class="text-center d-inline-block">
            <i class="fa-solid fa-flag"></i>
          </div>
          Pages
        </a>
        <a href="#" id="logout" class="marketplace">
          <div class="text-center d-inline-block">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </div>
          Logout
        </a>
      </div>

        <div class="d-none d-md-block">
          <img class="w-100 rounded-2 mt-2" src="${obj.sponsorImg}" />
        </div>
        </div>

        `
    )
} 
