document.addEventListener("DOMContentLoaded", () => {
    // جلب بيانات المستخدم المخزنة محلياً (اسم المستخدم والأيدي)
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
        const nameDisplay = document.getElementById("user-name-display");
        if (nameDisplay) nameDisplay.textContent = currentUser.username || "وضاح";
    }

    // إدارة نافذة الدعم الفني
    const supportBtn = document.getElementById("support-btn");
    const supportModal = document.getElementById("support-modal");
    const closeModal = document.getElementById("close-modal");
    const sendIssueBtn = document.getElementById("send-issue-btn");
    const issueText = document.getElementById("issue-text");

    if (supportBtn && supportModal) {
        supportBtn.addEventListener("click", () => {
            supportModal.style.display = "flex";
        });
    }

    if (closeModal && supportModal) {
        closeModal.addEventListener("click", () => {
            supportModal.style.display = "none";
        });
    }

    // إرسال المشكلة إلى Supabase
    if (sendIssueBtn) {
        sendIssueBtn.addEventListener("click", async () => {
            const text = issueText.value.trim();
            if (!text) {
                alert("الرجاء كتابة تفاصيل المشكلة قبل الإرسال.");
                return;
            }

            try {
                // حفظ المشكلة في جدول بـ Supabase (سيتم تخصيصه لعرضها في لوحة تحكم المطور)
                const { error } = await supabaseClient
                    .from("support_tickets")
                    .insert([
                        { 
                            username: currentUser ? currentUser.username : "زائر", 
                            user_id: currentUser ? currentUser.user_id : "0", 
                            issue_description: text,
                            status: "pending",
                            created_at: new Date()
                        }
                    ]);

                if (error) {
                    console.error("خطأ Supabase:", error);
                    alert("حدث خطأ أثناء الإرسال، تأكد من الاتصال بقاعدة البيانات.");
                } else {
                    alert("تم إرسال مشكلتك بنجاح إلى فريق المطورين!");
                    issueText.value = "";
                    supportModal.style.display = "none";
                }
            } catch (err) {
                console.error(err);
                alert("تعذر الاتصال بقاعدة البيانات.");
            }
        });
    }
});

// وظيفة التنقل بين الأقسام الرئيسية (الألعاب، البرمجة، التجمع الممتع)
function openSection(sectionKey) {
    if (sectionKey === 'games') {
        window.location.href = "games.html"; // سنقوم بإنشائه لاحقاً
    } else if (sectionKey === 'programming') {
        window.location.href = "programming.html"; // سنقوم بإنشائه لاحقاً
    } else if (sectionKey === 'gathering') {
        window.location.href = "gathering.html"; // سنقوم بإنشائه لاحقاً
    }
}
