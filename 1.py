# "Qahramon sayohati" matnli kvesti
import random

score = 0
inventory = []

print("🌟 'Qahramon sayohati' kvestiga xusg kelibsan!")
print("Sen chorrahada turibsan.")
choice = input("Qayerga borasan?(ormon/gor/qasr): ")

if choice == "ormon":
    print("Sen sehrli rezavor topding! +5 ochko")
    score += 5
    inventory.append("sehrli rezavor")
elif choice == "gor":
    print("Sen oltinga tola sandiqni topding! +10 ochko")
    score += 10
     inventory.append("oltin")
 elif choice == "qasr":
     print("Seni shoh kutib oldi va medal berdi! +20 ochko")
    score += 20
    inventory.append("shoh medli")
else:
    print("Sen adashding va uyga qayting...")

    print(f"\n✨ Natija: {score} ochko")
    print(f"Buyumlar: {inventory}")