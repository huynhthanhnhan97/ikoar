var list_Front_Content = ["Màn hình kích thước 6.9 inch sử dụng tấm nền Dynamic AMOLED 2X",
    "Màn hình trên Galaxy S20 Ultra có tần số quét lên tới 120 Hz",
    "Công nghệ HDR10+ cho trải nghiệm giải trí chơi game với chất lượng tuyệt vời",
    "Được bảo vệ bằng kính cường lực Gorilla Glass 6 với độ bền cao",
    "Sử dụng màn hình công nghệ Infinity O khoét lỗ cho camera selfie"
];

var list_Camera_Content = ["Camera đỉnh cao, độ phân giải siêu khủng 108 MP",
    "Sự kết hợp độc đáo giữa bộ 4 camera siêu khủng",
    "Chế độ Space Zoom 100x số 1 trên thế giới smartphone",
    "Tính năng quay phim chất điện ảnh 8K",
    "Kết hợp cùng công nghệ chống rung quang học OIS"
]

var list_Back_Content = ["Vi xử lý mạnh mẽ mang tên Exynos 990 với xung nhịp cao nhất có thể đạt tới  2.73 GHz",
    "Dung lượng RAM 12 GB và bộ nhớ trong 128 GB, hỗ trợ thẻ nhớ ngoài lên đến 1T",
    "điểm hiệu năng mạnh mẽ lên tới 503.122 điểm",
    "Pin dung lượng lớn 5000 mAh có hỗ trợ sạc nhanh 45 W",
    "Chế độ sạc không dây công suất 15W"
];

function noteClick() {
    let infoDiv = document.getElementById('note');
    if (infoDiv)
        infoDiv.style.display = 'none';
}

const createInformationDiv = function (listContent, type, parentDiv) {
    if (document.getElementById('note'))
        document.getElementById('note').remove();
    var divMaster = parentDiv ? parentDiv : document.body;
    var noteDiv = document.createElement('div');
    divMaster.appendChild(noteDiv);
    noteDiv.id = 'note';
    noteDiv.addEventListener('touchstart', noteClick);
    var listInfo = document.createElement('ul');
    switch (type) {
        case "marker":
            noteDiv.className = 'note';
            listInfo.className = 'noteContent';
            break;
        case "shake":
            noteDiv.className = 'note2';
            listInfo.className = "noteContent2";
            break;
        default:
            noteDiv.className = 'note';
            listInfo.className = 'noteContent';
            break;
    }
    for (let i = 0; i < listContent.length; i++) {
        var listItem = document.createElement('li');
        listItem.textContent = listContent[i];
        listInfo.appendChild(listItem);
    }
    noteDiv.appendChild(listInfo);
}

