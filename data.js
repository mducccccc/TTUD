const COURSE_INFO = {
  title: "Thuật toán ứng dụng",
  subtitle: "Đề cương ôn tập — CNTT Việt Anh 1 & 2 (K65)",
  examNote: "Đề thi 60 phút gồm 02 bài trong đề cương và 01 bài nằm ngoài đề cương.",
  tips: [
    "Đọc đề và tự tính tay ví dụ trước khi xem phần ý tưởng.",
    "Che phần chương trình (bật chế độ Tự luyện), tự cài đặt rồi nộp thử trên laptrinhonline.club theo mã bài.",
    "Với mỗi bài cần nói được: dùng cấu trúc dữ liệu gì, vì sao đúng, độ phức tạp bao nhiêu."
  ]
};

const PROBLEMS = [
  {
    id: 1,
    title: "Dãy con liên tục khác biệt",
    code: "tichpxtapkhacbiet",
    topic: "Từ điển, cửa sổ trượt",
    complexity: "O(n)",
    dataStructure: "Từ điển (Hash Map / dict) + Hai con trỏ",
    statement: {
      description:
        "Cho dãy n phần tử a₁, a₂, …, aₙ. Tìm một dãy con liên tục nhiều phần tử nhất có thể sao cho trong dãy con đó không có hai phần tử nào bằng nhau.",
      input:
        "Dòng đầu là n (1 ≤ n ≤ 1000); dòng sau chứa n số nguyên không âm, giá trị không vượt quá 32767.",
      output:
        "Một số tự nhiên là độ dài dãy con liên tục dài nhất không có hai phần tử bằng nhau.",
      examples: [
        {
          label: "Ví dụ",
          input: "12\n4 7 2 8 4 8 3 2 4 9 3 6",
          output: "5"
        }
      ]
    },
    idea: {
      points: [
        "Duy trì cửa sổ [left, i] không có phần tử trùng (kỹ thuật hai con trỏ).",
        "Từ điển last[x] lưu vị trí gần nhất của giá trị x.",
        "Xét a[i] = x: nếu x đã xuất hiện tại last[x] ≥ left thì dời left = last[x] + 1. Sau đó gán last[x] = i và cập nhật best = max(best, i − left + 1).",
        "Con trỏ left chỉ tiến nên độ phức tạp O(n), tốt hơn cách cố định điểm đầu rồi mở rộng O(n²)."
      ]
    },
    illustration: {
      tables: [
        {
          title: "Dãy 4 7 2 8 4 8 3 2 4 9 3 6 (chỉ số tính từ 0)",
          headers: ["i", "a[i]", "last[a[i]] trước đó", "left", "Độ dài i − left + 1", "best"],
          rows: [
            ["0", "4", "chưa có", "0", "1", "1"],
            ["1", "7", "chưa có", "0", "2", "2"],
            ["2", "2", "chưa có", "0", "3", "3"],
            ["3", "8", "chưa có", "0", "4", "4"],
            ["4", "4", "0 (≥ left)", "1", "4", "4"],
            ["5", "8", "3 (≥ left)", "4", "2", "4"],
            ["6", "3", "chưa có", "4", "3", "4"],
            ["7", "2", "2 (< left, bỏ qua)", "4", "4", "4"],
            ["8", "4", "4 (≥ left)", "5", "4", "4"],
            ["9", "9", "chưa có", "5", "5", "5"],
            ["10", "3", "6 (≥ left)", "7", "4", "5"],
            ["11", "6", "chưa có", "7", "5", "5"]
          ],
          note: "Kết quả 5, ứng với đoạn 8 3 2 4 9 (i = 5..9) hoặc 2 4 9 3 6 (i = 7..11)."
        }
      ]
    },
    solutions: [
      {
        label: "Python — Cửa sổ trượt",
        code: `n = int(input())
a = list(map(int, input().split()))
last = {}            # last[x]: vị trí gần nhất xuất hiện giá trị x
left = 0             # cửa sổ [left, i] không có phần tử trùng
best = 0
for i, x in enumerate(a):
    if x in last and last[x] >= left:
        left = last[x] + 1               # bỏ qua phần tử trùng cũ
    last[x] = i
    best = max(best, i - left + 1)
print(best)`
      }
    ]
  },
  {
    id: 2,
    title: "Chào đón tân sinh viên K59",
    code: "tichpxchaodonk59",
    topic: "Ngăn xếp đơn điệu",
    complexity: "O(n)",
    dataStructure: "Ngăn xếp đơn điệu (Monotonic Stack)",
    statement: {
      description:
        "Có n sinh viên xếp thành một hàng, đánh số từ 0 đến n − 1. Với mỗi bạn, hãy chỉ ra chỉ số của bạn đứng gần mình nhất mà có chiều cao cao hơn mình. Nếu có nhiều chỉ số cùng thỏa mãn thì lấy chỉ số bé hơn; nếu không có ai cao hơn thì chỉ số đó là −1.",
      input:
        "Dòng đầu là n (1 ≤ n ≤ 4·10⁴); dòng hai gồm n số nguyên, số thứ i là chiều cao của sinh viên thứ i (0 ≤ i < n).",
      output:
        "Một dòng gồm n số nguyên, số thứ i là chỉ số của sinh viên gần nhất cao hơn sinh viên thứ i.",
      examples: [
        {
          label: "Ví dụ",
          input: "6\n1 4 2 1 7 6",
          output: "1 4 1 2 -1 4"
        }
      ]
    },
    idea: {
      points: [
        "Người cao hơn gần nhất của i chỉ có thể là người cao hơn gần nhất bên trái (L) hoặc bên phải (R). So sánh khoảng cách i − L và R − i, bằng nhau thì chọn L vì chỉ số bé hơn.",
        "Tìm L bằng ngăn xếp đơn điệu: duyệt từ trái sang phải, loại khỏi đỉnh ngăn xếp mọi chỉ số có chiều cao ≤ a[i]. Phần tử còn lại ở đỉnh (nếu có) là L[i], sau đó đẩy i vào.",
        "Tìm R bằng cách làm tương tự từ phải sang trái.",
        "Mỗi chỉ số vào và ra ngăn xếp tối đa một lần nên độ phức tạp O(n)."
      ]
    },
    illustration: {
      tables: [
        {
          title: "Lượt trái sang phải — Dãy a = [1, 4, 2, 1, 7, 6] (ngăn xếp ghi theo chỉ số, đỉnh ở bên phải)",
          headers: ["i", "a[i]", "Loại khỏi ngăn xếp", "L[i]", "Ngăn xếp sau khi đẩy i"],
          rows: [
            ["0", "1", "không", "−1", "0"],
            ["1", "4", "0", "−1", "1"],
            ["2", "2", "không", "1", "1, 2"],
            ["3", "1", "không", "2", "1, 2, 3"],
            ["4", "7", "3, 2, 1", "−1", "4"],
            ["5", "6", "không", "4", "4, 5"]
          ],
          note: "Làm tương tự từ phải sang trái được R = [1, 4, 4, 4, −1, −1]."
        },
        {
          title: "Ghép kết quả từ L và R",
          headers: ["i", "L", "R", "i − L", "R − i", "Chọn"],
          rows: [
            ["0", "−1", "1", "—", "1", "1"],
            ["1", "−1", "4", "—", "3", "4"],
            ["2", "1", "4", "1", "2", "1"],
            ["3", "2", "4", "1", "1", "2 (bằng nhau, lấy bên trái)"],
            ["4", "−1", "−1", "—", "—", "−1"],
            ["5", "4", "−1", "1", "—", "4"]
          ],
          note: "Kết quả cuối cùng: 1 4 1 2 -1 4."
        }
      ]
    },
    solutions: [
      {
        label: "Python — Ngăn xếp đơn điệu",
        code: `import sys

def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    a = list(map(int, data[1:n + 1]))

    left = [-1] * n            # chỉ số người cao hơn gần nhất bên trái
    st = []
    for i in range(n):
        while st and a[st[-1]] <= a[i]:
            st.pop()
        if st:
            left[i] = st[-1]
        st.append(i)

    right = [-1] * n           # chỉ số người cao hơn gần nhất bên phải
    st = []
    for i in range(n - 1, -1, -1):
        while st and a[st[-1]] <= a[i]:
            st.pop()
        if st:
            right[i] = st[-1]
        st.append(i)

    res = []
    for i in range(n):
        L, R = left[i], right[i]
        if L == -1:
            res.append(R)
        elif R == -1:
            res.append(L)
        elif i - L <= R - i:   # bằng nhau thì lấy chỉ số bé hơn (bên trái)
            res.append(L)
        else:
            res.append(R)
    print(*res)

main()`
      }
    ]
  },
  {
    id: 3,
    title: "Khối lượng hóa chất",
    code: "tichpxweighthoachat",
    topic: "Ngăn xếp, biểu thức có ngoặc",
    complexity: "O(|s|)",
    dataStructure: "Ngăn xếp (Stack)",
    statement: {
      description:
        "Một chất hữu cơ chỉ gồm các nguyên tố C, H, O có khối lượng nguyên tử tương ứng C = 12, H = 1, O = 16. Ví dụ Axit capric CH3-CH2-CH2-CH2-CH2-CH2-CH2-CH2-CH2-COOH có dạng rút gọn là CH3(CH2)8CO2H. Cho một công thức ở dạng rút gọn, hãy tính khối lượng hóa chất đó, biết rằng số rút gọn chỉ nằm trong đoạn [2, 9].",
      input:
        "Dòng đầu là số trường hợp kiểm thử t (1 ≤ t ≤ 10). Mỗi trường hợp là một xâu trên một dòng, chỉ gồm các ký tự C, H, O, (, ) và các chữ số trong đoạn [2, 9], độ dài không vượt quá 500.",
      output:
        "Với mỗi công thức, in khối lượng của hóa chất đó (số tự nhiên không vượt quá 10⁹) trên một dòng.",
      examples: [
        {
          label: "Ví dụ",
          input: "2\n((CHOH)2(CO2H)2H2O)4\nCH3((CHCO2H)2(CH2)8CO2H)3H2CO3H",
          output: "672\n897"
        }
      ]
    },
    idea: {
      points: [
        "Biểu thức có ngoặc lồng nhau nên dùng ngăn xếp: mỗi phần tử là tổng khối lượng của một cấp ngoặc đang mở, st[-1] là cấp hiện tại. Biến last nhớ khối lượng của “khối” vừa đọc xong (một nguyên tố hoặc cả một nhóm trong ngoặc).",
        "Gặp C, H, O: last = khối lượng nguyên tố, cộng vào st[-1].",
        "Gặp “(”: đẩy 0 vào ngăn xếp để mở cấp mới.",
        "Gặp “)”: lấy tổng cấp trong ra làm last, cộng vào cấp ngoài.",
        "Gặp chữ số d: khối last cần xuất hiện d lần nhưng đã cộng 1 lần, nên cộng thêm last · (d − 1).",
        "Độ phức tạp O(độ dài xâu)."
      ]
    },
    illustration: {
      tables: [
        {
          title: "Công thức ((CHOH)2(CO2H)2H2O)4 — Ngăn xếp ban đầu [0], đỉnh ở bên phải",
          headers: ["Đọc", "Xử lý", "last", "Ngăn xếp"],
          rows: [
            ["( (", "mở hai cấp", "—", "0, 0, 0"],
            ["C H O H", "cộng 12 + 1 + 16 + 1", "1", "0, 0, 30"],
            [")", "đóng cấp, cộng 30 ra ngoài", "30", "0, 30"],
            ["2", "cộng thêm 30·(2 − 1)", "30", "0, 60"],
            ["(", "mở cấp", "—", "0, 60, 0"],
            ["C O", "cộng 12 + 16", "16", "0, 60, 28"],
            ["2", "cộng thêm 16·(2 − 1)", "16", "0, 60, 44"],
            ["H", "cộng 1", "1", "0, 60, 45"],
            [")", "đóng cấp, cộng 45 ra ngoài", "45", "0, 105"],
            ["2", "cộng thêm 45·(2 − 1)", "45", "0, 150"],
            ["H", "cộng 1", "1", "0, 151"],
            ["2", "cộng thêm 1·(2 − 1)", "1", "0, 152"],
            ["O", "cộng 16", "16", "0, 168"],
            [")", "đóng cấp, cộng 168 ra ngoài", "168", "168"],
            ["4", "cộng thêm 168·(4 − 1)", "168", "672"]
          ],
          note: "Kết quả 672."
        }
      ]
    },
    solutions: [
      {
        label: "Python — Ngăn xếp",
        code: `W = {'C': 12, 'H': 1, 'O': 16}

def mass(s):
    st = [0]          # st[-1]: tổng khối lượng của nhóm đang xét
    last = 0          # khối lượng của phần tử/nhóm vừa đọc xong
    for ch in s:
        if ch in W:
            last = W[ch]
            st[-1] += last
        elif ch == '(':
            st.append(0)
        elif ch == ')':
            last = st.pop()
            st[-1] += last
        elif ch.isdigit():
            st[-1] += last * (int(ch) - 1)   # đã cộng 1 lần, cộng thêm (k-1) lần
    return st[0]

t = int(input())
for _ in range(t):
    print(mass(input().strip()))`
      }
    ]
  },
  {
    id: 4,
    title: "Trinh thám",
    code: "tichpxtrinhtham",
    topic: "Hàng đợi hai đầu (deque)",
    complexity: "O(n)",
    dataStructure: "Hàng đợi hai đầu đơn điệu (Monotonic Deque)",
    statement: {
      description:
        "Amas đi trinh thám và quan sát quân đỏ đang dàn hàng ngang bằng ống nhòm. Mỗi khung nhìn chỉ thấy k lính liên tiếp, mỗi lần khung nhìn tịnh tiến một đơn vị từ đầu đến cuối hàng. Với n quân đỏ có chiều cao lần lượt a₁, a₂, …, aₙ và khung nhìn rộng k, hãy tìm chiều cao lớn nhất trong từng vị trí khung nhìn.",
      input:
        "Dòng đầu chứa n (1 ≤ n ≤ 10⁵) và k (1 ≤ k ≤ n); dòng hai chứa n số nguyên là chiều cao của quân đỏ (1 ≤ aᵢ ≤ 10⁴).",
      output:
        "n − k + 1 số nguyên là chiều cao lớn nhất trong từng khung nhìn.",
      examples: [
        {
          label: "Ví dụ",
          input: "8 3\n4 7 2 5 6 3 9 1",
          output: "7 7 6 6 9 9"
        }
      ]
    },
    idea: {
      points: [
        "Bài toán “cửa sổ trượt lấy max”. Tính max từng cửa sổ mất O(n·k), quá chậm. Dùng hàng đợi hai đầu (deque) lưu chỉ số sao cho giá trị tương ứng giảm dần từ đầu đến cuối.",
        "Khi thêm a[i]: loại khỏi cuối deque mọi chỉ số có giá trị ≤ a[i] vì chúng không bao giờ là max nữa, rồi thêm i vào cuối.",
        "Nếu chỉ số ở đầu deque đã ra khỏi cửa sổ (≤ i − k) thì loại bỏ.",
        "Khi i ≥ k − 1, phần tử đầu deque là max của cửa sổ [i − k + 1, i].",
        "Mỗi chỉ số vào và ra deque nhiều nhất một lần nên độ phức tạp O(n)."
      ]
    },
    illustration: {
      tables: [
        {
          title: "Dãy 4 7 2 5 6 3 9 1, k = 3 — Deque ghi dạng chỉ số(giá trị), đầu ở bên trái",
          headers: ["i", "a[i]", "Loại ở cuối", "Loại ở đầu", "Deque", "In ra"],
          rows: [
            ["0", "4", "—", "—", "0(4)", "—"],
            ["1", "7", "0(4)", "—", "1(7)", "—"],
            ["2", "2", "—", "—", "1(7), 2(2)", "7"],
            ["3", "5", "2(2)", "—", "1(7), 3(5)", "7"],
            ["4", "6", "3(5)", "1(7) vì 1 ≤ 4 − 3", "4(6)", "6"],
            ["5", "3", "—", "—", "4(6), 5(3)", "6"],
            ["6", "9", "5(3), 4(6)", "—", "6(9)", "9"],
            ["7", "1", "—", "—", "6(9), 7(1)", "9"]
          ],
          note: "Kết quả 7 7 6 6 9 9."
        }
      ]
    },
    solutions: [
      {
        label: "Python — Deque",
        code: `import sys
from collections import deque

def main():
    data = sys.stdin.buffer.read().split()
    n, k = int(data[0]), int(data[1])
    a = list(map(int, data[2:2 + n]))

    dq = deque()       # lưu chỉ số, giá trị a giảm dần từ đầu đến cuối
    res = []
    for i in range(n):
        while dq and a[dq[-1]] <= a[i]:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:             # phần tử đầu đã ra khỏi khung nhìn
            dq.popleft()
        if i >= k - 1:
            res.append(a[dq[0]])
    print(*res)

main()`
      }
    ]
  },
  {
    id: 5,
    title: "Liên lạc",
    code: "kkpy10",
    topic: "DFS, thành phần liên thông",
    complexity: "O(N + M)",
    dataStructure: "Danh sách kề + Ngăn xếp (DFS)",
    statement: {
      description:
        "Một lớp gồm N học sinh, mỗi học sinh cho biết những bạn mà mình có thể liên lạc được (liên lạc hai chiều: u gửi tin được tới v thì v cũng gửi tin được tới u). Thầy Tích cần thông báo lịch thi tới tất cả học sinh. Để tiết kiệm thời gian, thầy chỉ nhắn tin tới một số học sinh mà thầy tin cậy nhất, rồi nhờ các học sinh này nhắn lại cho các bạn mà mình liên lạc được, cứ lần lượt như thế sao cho cả lớp đều nhận được tin. Hãy tìm số ít nhất các học sinh mà thầy cần nhắn tin và liệt kê những bạn đó.",
      input:
        "Dòng đầu gồm N và M là số học sinh và số liên lạc hai chiều (2 ≤ N ≤ 1000, 0 ≤ M ≤ N(N − 1)/2). Dòng hai gồm N số nguyên dương phân biệt t[i] là độ tin cậy của học sinh thứ i (1 ≤ t[i] ≤ 10⁵). M dòng tiếp theo, mỗi dòng gồm hai số u, v cho biết u và v liên lạc được với nhau.",
      output:
        "Dòng đầu là số học sinh tối thiểu thầy cần nhắn tin; dòng hai là những học sinh thầy đã liên lạc, in theo thứ tự tăng dần.",
      examples: [
        {
          label: "Ví dụ",
          input: "5 4\n90 85 100 75 65\n1 2\n1 3\n2 3\n4 5",
          output: "2\n3 4"
        }
      ]
    },
    idea: {
      points: [
        "Học sinh là đỉnh, liên lạc là cạnh vô hướng. Tin nhắn lan hết trong một thành phần liên thông, nên số học sinh ít nhất cần nhắn bằng số thành phần liên thông.",
        "Trong mỗi thành phần chọn học sinh có độ tin cậy lớn nhất (các t[i] phân biệt nên lựa chọn là duy nhất).",
        "Duyệt các đỉnh từ 1 đến N; gặp đỉnh chưa thăm thì tìm kiếm theo chiều sâu (DFS) bằng ngăn xếp: lấy đỉnh u ở đỉnh ngăn xếp, cập nhật học sinh tin cậy nhất, đẩy các đỉnh kề chưa thăm vào ngăn xếp và đánh dấu ngay khi đẩy.",
        "Sắp xếp danh sách học sinh được chọn tăng dần rồi in. Độ phức tạp O(N + M). Cách khác: BFS bằng hàng đợi hoặc cấu trúc DSU."
      ]
    },
    illustration: {
      tables: [
        {
          title: "Độ tin cậy t = [90, 85, 100, 75, 65]; danh sách kề: 1:{2,3}, 2:{1,3}, 3:{1,2}, 4:{5}, 5:{4}",
          headers: ["Đỉnh bắt đầu", "Lấy ra", "Đẩy vào ngăn xếp", "Ngăn xếp sau bước", "Tin cậy nhất"],
          rows: [
            ["1", "1", "2, 3", "2, 3", "1 (90)"],
            ["", "3", "không", "2", "3 (100)"],
            ["", "2", "không", "rỗng", "3 (100)"],
            ["4", "4", "5", "5", "4 (75)"],
            ["", "5", "không", "rỗng", "4 (75)"]
          ],
          note: "Các đỉnh 2, 3, 5 đã thăm nên không bắt đầu thành phần mới. Có 2 thành phần {1, 2, 3} và {4, 5}, chọn học sinh 3 và 4."
        }
      ]
    },
    solutions: [
      {
        label: "Python — DFS bằng ngăn xếp",
        code: `import sys

def main():
    data = sys.stdin.buffer.read().split()
    n, m = int(data[0]), int(data[1])
    t = [0] + list(map(int, data[2:2 + n]))  # độ tin cậy, đánh số học sinh từ 1
    ke = [[] for _ in range(n + 1)]  # danh sách kề
    idx = 2 + n
    for _ in range(m):
        u, v = int(data[idx]), int(data[idx + 1])
        idx += 2
        ke[u].append(v)
        ke[v].append(u)

    tham = [False] * (n + 1)
    chon = []
    for s in range(1, n + 1):
        if not tham[s]:  # thành phần liên thông mới
            tham[s] = True
            st = [s]  # ngăn xếp cho DFS
            best = s  # học sinh tin cậy nhất của thành phần
            while st:
                u = st.pop()
                if t[u] > t[best]:
                    best = u
                for v in ke[u]:
                    if not tham[v]:
                        tham[v] = True
                        st.append(v)
            chon.append(best)

    chon.sort()
    print(len(chon))
    print(*chon)

main()`
      }
    ]
  },
  {
    id: 6,
    title: "Thuật toán mã hóa Huffman",
    code: "tichpxhuffman",
    topic: "Hàng đợi ưu tiên, tham lam",
    complexity: "O(L + 26 log 26)",
    dataStructure: "Hàng đợi ưu tiên (Min-Heap / heapq)",
    statement: {
      description:
        "Mã hóa Huffman là thuật toán nén dữ liệu không mất thông tin dựa trên mã tiền tố. Cho một xâu chỉ gồm những chữ hoa tiếng Anh, hãy cho biết sau khi mã hóa Huffman thì tổng số bit là bao nhiêu.",
      input:
        "Một xâu có độ dài không quá 10⁵ ký tự hoa tiếng Anh.",
      output:
        "Một số nguyên dương là tổng số bit sau khi mã hóa Huffman xâu đầu vào.",
      examples: [
        {
          label: "Ví dụ",
          input: "GIAOTHONGVANTAI",
          output: "44"
        }
      ]
    },
    idea: {
      points: [
        "Đếm tần số xuất hiện của từng ký tự.",
        "Thuật toán Huffman (tham lam): đưa các tần số vào hàng đợi ưu tiên (min-heap). Lặp lại việc lấy ra hai nút nhỏ nhất x, y, ghép thành nút cha có trọng số x + y rồi đưa lại vào heap, cho tới khi còn một nút.",
        "Không cần dựng cây: mỗi lần ghép, mọi ký tự nằm dưới hai nút x, y có mã dài thêm 1 bit, nên tổng số bit tăng đúng x + y. Tổng số bit bằng tổng các giá trị x + y qua các lần ghép.",
        "Trường hợp đặc biệt: xâu chỉ có một loại ký tự thì mỗi ký tự vẫn cần 1 bit, đáp án là độ dài xâu.",
        "Độ phức tạp O(L + 26 log 26) với L là độ dài xâu."
      ]
    },
    illustration: {
      tables: [
        {
          title: "Xâu GIAOTHONGVANTAI (15 ký tự) — Tần số: A:3, G:2, I:2, O:2, T:2, N:2, H:1, V:1",
          headers: ["Lần ghép", "Hai nút nhỏ nhất", "Nút mới", "Tổng bit", "Heap sau khi ghép"],
          rows: [
            ["ban đầu", "—", "—", "0", "1 1 2 2 2 2 2 3"],
            ["1", "1, 1", "2", "2", "2 2 2 2 2 2 3"],
            ["2", "2, 2", "4", "6", "2 2 2 2 3 4"],
            ["3", "2, 2", "4", "10", "2 2 3 4 4"],
            ["4", "2, 2", "4", "14", "3 4 4 4"],
            ["5", "3, 4", "7", "21", "4 4 7"],
            ["6", "4, 4", "8", "29", "7 8"],
            ["7", "7, 8", "15", "44", "15"]
          ],
          note: "Kết quả 44 bit, so với 15 × 8 = 120 bit nếu mỗi ký tự dùng 8 bit."
        }
      ]
    },
    solutions: [
      {
        label: "Python — Min-Heap (heapq)",
        code: `import heapq

s = input().strip()
tan_so = {}
for ch in s:
    tan_so[ch] = tan_so.get(ch, 0) + 1

heap = list(tan_so.values())
heapq.heapify(heap)

if len(heap) == 1:            # chỉ có 1 loại ký tự: mỗi ký tự cần 1 bit
    print(len(s))
else:
    tong_bit = 0
    while len(heap) > 1:
        x = heapq.heappop(heap)       # hai nút có tần số nhỏ nhất
        y = heapq.heappop(heap)
        tong_bit += x + y             # mọi lá bên dưới dài thêm 1 bit
        heapq.heappush(heap, x + y)
    print(tong_bit)`
      }
    ]
  },
  {
    id: 7,
    title: "Cây khung nhỏ nhất",
    code: "tichpxmst",
    topic: "Prim + hàng đợi ưu tiên, Kruskal",
    complexity: "O(m log m)",
    dataStructure: "DSU (Kruskal) hoặc Min-Heap (Prim)",
    statement: {
      description:
        "Cho đơn đồ thị liên thông vô hướng có trọng số trên cạnh gồm n đỉnh và m cạnh, các đỉnh đánh số từ 1 tới n. Hãy tìm cây khung nhỏ nhất của đồ thị.",
      input:
        "Dòng đầu chứa n, m (1 ≤ n ≤ 10000, 1 ≤ m ≤ 20000). m dòng tiếp theo, mỗi dòng chứa ba số nguyên u, v, w: (u, v) là hai đỉnh đầu mút, w là trọng số của cạnh (1 ≤ u, v ≤ n, 1 ≤ w ≤ 1000).",
      output:
        "Một số nguyên là trọng số nhỏ nhất của cây khung.",
      examples: [
        {
          label: "Ví dụ",
          input: "7 11\n1 2 4\n1 3 1\n1 7 3\n2 4 6\n2 3 2\n2 5 1\n3 5 8\n3 6 3\n4 5 5\n5 6 2\n5 7 3",
          output: "14"
        }
      ]
    },
    idea: {
      points: [
        "Lưu ý: Cách 2 (Prim với hàng đợi ưu tiên) là cách đã học trên lớp; Cách 1 (Kruskal) là lời giải trong hướng dẫn thực hành.",
        "Cách 1 – Kruskal: Sắp xếp các cạnh theo trọng số tăng dần. Lần lượt xét từng cạnh: nếu hai đầu mút đang thuộc hai thành phần khác nhau (không tạo chu trình) thì chọn cạnh và hợp nhất hai thành phần. Kiểm tra “cùng thành phần” bằng cấu trúc DSU (find/union). Dừng khi đã chọn đủ n − 1 cạnh. Độ phức tạp O(m log m).",
        "Cách 2 – Prim với hàng đợi ưu tiên: Bắt đầu từ đỉnh 1, đưa (0, 1) vào heap. Mỗi lần lấy ra cặp (w, u) nhỏ nhất; nếu u đã xét thì bỏ qua, ngược lại cộng w vào kết quả, đánh dấu u rồi đưa mọi cạnh (w’, v) với v chưa xét vào heap. Độ phức tạp O(m log m)."
      ]
    },
    illustration: {
      tables: [
        {
          title: "Kruskal trên ví dụ — Các cạnh đã sắp xếp theo trọng số",
          headers: ["Cạnh (u, v)", "w", "Quyết định", "Tổng", "Các thành phần sau bước"],
          rows: [
            ["(1, 3)", "1", "chọn", "1", "{1,3} {2} {4} {5} {6} {7}"],
            ["(2, 5)", "1", "chọn", "2", "{1,3} {2,5} {4} {6} {7}"],
            ["(2, 3)", "2", "chọn", "4", "{1,2,3,5} {4} {6} {7}"],
            ["(5, 6)", "2", "chọn", "6", "{1,2,3,5,6} {4} {7}"],
            ["(1, 7)", "3", "chọn", "9", "{1,2,3,5,6,7} {4}"],
            ["(3, 6)", "3", "bỏ, tạo chu trình", "9", "—"],
            ["(5, 7)", "3", "bỏ, tạo chu trình", "9", "—"],
            ["(1, 2)", "4", "bỏ, tạo chu trình", "9", "—"],
            ["(4, 5)", "5", "chọn, đủ 6 cạnh thì dừng", "14", "{1,2,3,4,5,6,7}"]
          ],
          note: "Prim từ đỉnh 1 cho cùng kết quả, thứ tự kết nạp đỉnh (trọng số cạnh): 1 (0), 3 (1), 2 (2), 5 (1), 6 (2), 7 (3), 4 (5). Tổng 14."
        }
      ]
    },
    solutions: [
      {
        label: "Cách 1 — Kruskal (DSU)",
        code: `import sys

def main():
    data = sys.stdin.buffer.read().split()
    n, m = int(data[0]), int(data[1])
    edges = []
    for i in range(m):
        u, v, w = (int(x) for x in data[2 + 3 * i:5 + 3 * i])
        edges.append((w, u, v))
    edges.sort()  # Kruskal: xét cạnh theo trọng số tăng

    parent = list(range(n + 1))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    tong, so_canh = 0, 0
    for w, u, v in edges:
        ru, rv = find(u), find(v)
        if ru != rv:  # không tạo chu trình thì chọn cạnh
            parent[ru] = rv
            tong += w
            so_canh += 1
            if so_canh == n - 1:
                break
    print(tong)

main()`
      },
      {
        label: "Cách 2 — Prim (Min-Heap)",
        code: `import sys, heapq

data = sys.stdin.read().split()
n, m = int(data[0]), int(data[1])
ke = [[] for _ in range(n + 1)]
for i in range(m):
    u, v, w = map(int, data[2 + 3 * i:5 + 3 * i])
    ke[u].append((w, v))
    ke[v].append((w, u))

da_xet = [False] * (n + 1)
pq = [(0, 1)]
tong = 0
while pq:
    w, u = heapq.heappop(pq)
    if da_xet[u]:
        continue
    da_xet[u] = True
    tong += w
    for w2, v in ke[u]:
        if not da_xet[v]:
            heapq.heappush(pq, (w2, v))
print(tong)`
      }
    ]
  },
  {
    id: 8,
    title: "Cắt thanh kim loại",
    code: "tichpcatkimloai",
    topic: "Cây nhị phân, xử lý ngược",
    complexity: "O(n log n) trung bình / O(n²) xấu nhất",
    dataStructure: "Cây nhị phân các đoạn (Binary Tree)",
    statement: {
      description:
        "Một Robot cắt thanh kim loại nằm ngang, ban đầu dài m đơn vị, thành các đoạn nhỏ. Robot thực hiện n lần cắt, lần thứ i cắt tại vị trí cách mép trái của thanh ban đầu aᵢ đơn vị, hai lần cắt không bao giờ cùng một vị trí. Sau mỗi lần cắt, hãy cho biết độ dài của đoạn con dài nhất.",
      input:
        "Dòng đầu chứa n, m (1 ≤ n ≤ 10⁵, n < m ≤ 10⁶). Dòng hai chứa n số nguyên dương là vị trí n lần cắt, không trùng nhau và 1 ≤ aᵢ < m.",
      output:
        "Sau mỗi nhát cắt, in độ dài đoạn dài nhất hiện thời.",
      examples: [
        {
          label: "Ví dụ 1",
          input: "5 20\n13 8 17 5 9",
          output: "13 8 8 5 5"
        },
        {
          label: "Ví dụ 2",
          input: "10 1000\n177 145 608 906 783 735 34 561 464 641",
          output: "823 823 431 431 431 431 431 384 287 287"
        }
      ]
    },
    idea: {
      points: [
        "Cách 1 – Cây nhị phân các đoạn: Mỗi nút quản lý một đoạn [a, b] và lưu elem là độ dài đoạn con dài nhất bên trong nó. Gốc là [0, m].",
        "Cắt tại k: đi từ gốc xuống, nếu nút là lá thì tách thành hai con [a, k] và [k, b]; nếu không thì đi sang con trái khi điểm cuối của con trái lớn hơn k, ngược lại sang con phải.",
        "Khi quay lui, cập nhật elem = max(elem con trái, elem con phải). Đáp án sau mỗi nhát cắt là elem của gốc.",
        "Mỗi nhát cắt tốn thời gian bằng chiều cao cây. Cây có thể lệch khi các vị trí cắt tăng dần, khi đó cần tăng giới hạn đệ quy và thời gian xấu nhất là O(n²).",
        "Cách 2 – Xử lý ngược (hàn lại nhát cắt): Xuất phát từ trạng thái đã cắt hết mọi vị trí, rồi lần lượt hàn ngược từng nhát cắt từ cuối về đầu để gộp hai đoạn kề nhau và cập nhật độ dài lớn nhất."
      ]
    },
    illustration: {
      tables: [
        {
          title: "Ví dụ 1 theo Cách 1 (Cây nhị phân) — Thanh [0, 20]",
          headers: ["Cắt tại", "Đường đi trên cây", "Lá bị tách", "Các đoạn sau khi cắt", "elem gốc"],
          rows: [
            ["13", "gốc", "[0,20] thành [0,13], [13,20]", "13, 7", "13"],
            ["8", "gốc, trái", "[0,13] thành [0,8], [8,13]", "8, 5, 7", "8"],
            ["17", "gốc, phải", "[13,20] thành [13,17], [17,20]", "8, 5, 4, 3", "8"],
            ["5", "gốc, trái, trái", "[0,8] thành [0,5], [5,8]", "5, 3, 5, 4, 3", "5"],
            ["9", "gốc, trái, phải", "[8,13] thành [8,9], [9,13]", "5, 3, 1, 4, 4, 3", "5"]
          ],
          note: "Kết quả sau từng nhát cắt: 13 8 8 5 5."
        },
        {
          title: "Ví dụ 1 theo Cách 2 (Xử lý ngược) — Trạng thái đã cắt hết: 0, 5, 8, 9, 13, 17, 20 (best = 5)",
          headers: ["i", "Ghi ans[i] = best", "Hàn lại nhát cắt", "Đoạn gộp [L, R]", "best mới"],
          rows: [
            ["5", "5", "9", "[8, 13] dài 5", "5"],
            ["4", "5", "5", "[0, 8] dài 8", "8"],
            ["3", "8", "17", "[13, 20] dài 7", "8"],
            ["2", "8", "8", "[0, 13] dài 13", "13"],
            ["1", "13", "13", "[0, 20] dài 20", "20"]
          ],
          note: "Đọc ans theo i tăng dần: 13 8 8 5 5."
        }
      ]
    },
    solutions: [
      {
        label: "Python — Cây nhị phân",
        code: `import sys
sys.setrecursionlimit(300000)

class Node:
    def __init__(self, a, b):
        self.a, self.b = a, b
        self.elem = b - a
        self.left = self.right = None

def update(H, k):
    if H.left is None:
        H.left, H.right = Node(H.a, k), Node(k, H.b)
    else:
        update(H.left if H.left.b > k else H.right, k)
    H.elem = max(H.left.elem, H.right.elem)

n, m = map(int, input().split())
root = Node(0, m)
res = []
for k in map(int, input().split()):
    update(root, k)
    res.append(root.elem)
print(*res)`
      }
    ]
  },
  {
    id: 9,
    title: "Đếm số nghịch thế",
    code: "",
    topic: "Cây nhị phân theo miền giá trị",
    complexity: "O(n log n)",
    dataStructure: "Cây nhị phân theo miền giá trị (Segment Tree)",
    statement: {
      description:
        "Cho dãy n số nguyên a₁, a₂, …, aₙ. Một cặp chỉ số (i, j) được gọi là một nghịch thế nếu i < j và aᵢ > aⱼ. Hãy đếm số nghịch thế của dãy.",
      input:
        "Dòng đầu là số nguyên dương n (1 ≤ n ≤ 10⁵); dòng hai gồm n số nguyên aᵢ (1 ≤ aᵢ ≤ n).",
      output:
        "Một số nguyên là số nghịch thế của dãy.",
      examples: [
        {
          label: "Ví dụ",
          input: "5\n3 1 4 5 2",
          output: "4 (các cặp giá trị (3, 1), (3, 2), (4, 2), (5, 2))"
        }
      ]
    },
    idea: {
      points: [
        "So sánh mọi cặp mất O(n²), quá chậm với n = 10⁵. Dùng cây nhị phân quản lý miền giá trị: mỗi nút ứng với một đoạn giá trị [a, b) và lưu elem là số phần tử đã chèn có giá trị thuộc đoạn đó. Gốc là [1, n + 1), nút [a, b) có hai con [a, mid) và [mid, b) với mid = (a + b) // 2, lá là đoạn chỉ có một giá trị.",
        "Duyệt dãy từ trái sang phải, chèn lần lượt từng giá trị k: đi từ gốc xuống lá chứa k, tăng elem của mọi nút trên đường đi.",
        "Mỗi lần rẽ sang con trái, mọi phần tử đã nằm trong con phải đều đến trước và lớn hơn k, nên cộng elem của con phải vào kết quả. Tổng các lần cộng chính là số phần tử đứng trước và lớn hơn k.",
        "Cây cao khoảng log₂ n nên mỗi lần chèn tốn O(log n), toàn bộ O(n log n). Kết quả có thể tới cỡ n²/2 ≈ 5·10⁹; Python không lo tràn số."
      ]
    },
    illustration: {
      tables: [
        {
          title: "Dãy 3 1 4 5 2, n = 5 — Các nút: [1,6); [1,3), [3,6); [1,2), [2,3), [3,4), [4,6); [4,5), [5,6)",
          headers: ["Chèn k", "Đường đi từ gốc", "Cộng thêm khi rẽ trái", "res"],
          rows: [
            ["3", "[1,6) phải, [3,6) trái, [3,4)", "elem [4,6) = 0", "0"],
            ["1", "[1,6) trái, [1,3) trái, [1,2)", "elem [3,6) = 1; elem [2,3) = 0", "1"],
            ["4", "[1,6) phải, [3,6) phải, [4,6) trái, [4,5)", "elem [5,6) = 0", "1"],
            ["5", "[1,6) phải, [3,6) phải, [4,6) phải, [5,6)", "không rẽ trái", "1"],
            ["2", "[1,6) trái, [1,3) phải, [2,3)", "elem [3,6) = 3", "4"]
          ],
          note: "Kết quả 4. Khi chèn 2, con phải [3,6) của gốc đã chứa ba phần tử 3, 4, 5, đều đứng trước và lớn hơn 2."
        }
      ]
    },
    solutions: [
      {
        label: "Python — Cây nhị phân theo miền giá trị",
        code: `import sys

class Node:
    def __init__(self, x, y):
        self.a, self.b, self.elem = x, y, 0       # nút quản lý các giá trị trong [a, b), đã có elem phần tử
        if x + 1 < y:
            self.left = Node(x, (x + y) // 2)
            self.right = Node((x + y) // 2, y)
        else:
            self.left = self.right = None

res = 0
def update(H, k):                # chèn giá trị k vào cây
    global res
    H.elem += 1
    if H.left is None:
        return
    if k < H.left.b:
        update(H.left, k)
        res += H.right.elem      # các phần tử đến trước và lớn hơn k
    else:
        update(H.right, k)

data = sys.stdin.read().split()
n = int(data[0])
root = Node(1, n + 1)
for k in map(int, data[1:n + 1]):
    update(root, k)
print(res)`
      }
    ]
  },
  {
    id: 10,
    title: "Truy vấn max",
    code: "",
    topic: "Cây nhị phân theo đoạn chỉ số",
    complexity: "O((n + q) log n)",
    dataStructure: "Cây nhị phân theo đoạn chỉ số (Segment Tree)",
    statement: {
      description:
        "Cho dãy n số nguyên a₁, a₂, …, aₙ và q truy vấn. Mỗi truy vấn gồm hai chỉ số L, R; hãy cho biết giá trị lớn nhất trong các phần tử a[L], a[L+1], …, a[R].",
      input:
        "Dòng đầu gồm n và q (1 ≤ n, q ≤ 10⁵); dòng hai gồm n số nguyên aᵢ (|aᵢ| ≤ 10⁹); q dòng tiếp theo, mỗi dòng gồm hai số L, R (1 ≤ L ≤ R ≤ n).",
      output:
        "Với mỗi truy vấn in giá trị lớn nhất của đoạn trên một dòng.",
      examples: [
        {
          label: "Ví dụ",
          input: "6 4\n3 1 4 1 5 2\n1 3\n2 4\n4 6\n2 2",
          output: "4\n4\n5\n1"
        }
      ]
    },
    idea: {
      points: [
        "Tìm max trực tiếp cho từng truy vấn mất O(n·q), quá chậm. Dùng cây nhị phân quản lý các đoạn chỉ số: nút [a, b) lưu e là max của các phần tử có chỉ số trong đoạn. Gốc là [1, n + 1), nút [a, b) có hai con [a, mid) và [mid, b), lá ứng với một phần tử.",
        "Cập nhật a[i] = x: đi từ gốc xuống lá chứa i, tại mỗi nút gán e = max(e, x).",
        "Truy vấn get(H, L, R) trên nửa khoảng [L, R): nếu [L, R) trùng đoạn của nút thì trả về e; nếu [L, R) nằm trọn trong con trái hoặc con phải thì xuống con đó; ngược lại tách thành hai phần tại điểm chia và lấy max của hai kết quả. Truy vấn L, R của đề gọi get(gốc, L, R + 1).",
        "Mỗi lần cập nhật và mỗi truy vấn tốn O(log n), toàn bộ O((n + q) log n)."
      ]
    },
    illustration: {
      tables: [
        {
          title: "Dãy 3 1 4 1 5 2 — Giá trị e của các nút sau khi đưa cả dãy vào cây",
          headers: ["Nút", "[1,7)", "[1,4)", "[4,7)", "[1,2)", "[2,4)", "[4,5)", "[5,7)", "[2,3)", "[3,4)", "[5,6)", "[6,7)"],
          rows: [
            ["e", "5", "4", "5", "3", "4", "1", "5", "1", "4", "5", "2"]
          ],
          note: "Mỗi nút lưu giá trị lớn nhất trên đoạn chỉ số nửa mở [a, b)."
        },
        {
          title: "Minh họa các truy vấn",
          headers: ["Truy vấn", "Gọi", "Cách xử lý", "Kết quả"],
          rows: [
            ["1 3", "get [1,4)", "nằm trọn trong con trái của gốc, trùng nút [1,4)", "4"],
            ["2 4", "get [2,5)", "tách tại 4: [2,4) trùng nút [2,4) cho 4; [4,5) trùng nút [4,5) cho 1", "4"],
            ["4 6", "get [4,7)", "nằm trọn trong con phải của gốc, trùng nút [4,7)", "5"],
            ["2 2", "get [2,3)", "xuống [1,4), xuống [2,4), trùng nút [2,3)", "1"]
          ],
          note: "Kết quả lần lượt: 4, 4, 5, 1."
        }
      ]
    },
    solutions: [
      {
        label: "Python — Segment Tree (Truy vấn max)",
        code: `import sys

class Node:
    def __init__(self, x, y):
        self.a, self.b, self.e = x, y, -10**9     # nút quản lý các vị trí trong [a, b), e là max của đoạn
        if x + 1 == y:
            self.le = self.ri = None
        else:
            self.le = Node(x, (x + y) // 2)
            self.ri = Node((x + y) // 2, y)

def update(H, i, x):             # đưa a[i] = x vào cây H
    H.e = max(H.e, x)
    if H.le is not None:
        update(H.le if i < H.le.b else H.ri, i, x)

def get(H, L, R):                # max của các vị trí trong [L, R)
    if H.a == L and H.b == R:
        return H.e
    if R <= H.le.b:
        return get(H.le, L, R)
    if L >= H.ri.a:
        return get(H.ri, L, R)
    return max(get(H.le, L, H.le.b), get(H.ri, H.ri.a, R))

data = sys.stdin.read().split()
n, q = int(data[0]), int(data[1])
root = Node(1, n + 1)
for i in range(1, n + 1):
    update(root, i, int(data[1 + i]))

out = []
for j in range(q):
    L, R = int(data[2 + n + 2 * j]), int(data[3 + n + 2 * j])
    out.append(get(root, L, R + 1))
print("\\n".join(map(str, out)))`
      }
    ]
  }
];
