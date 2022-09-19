import pyautogui
import time
import random
import requests

TELEGRAM_BOT_TOKEN = "5646454243:AAFZ6-njSBN2yzhFx1z7kYBJLf5o64bTjIw"
TELEGRAM_CHAT_ID = "1146597167"

PAUSE_BETWEEN_POLLING = 1 # in sec
REFRESH_POLL_COUNT = 10

REFRESH_POSITION = (83, 50)

QUEUEING_BUILDING_POSITION = (654, 676)
CANCEL_BUILDING_COLOR = (217, 15, 15)
WHITE_COLOR = (237, 239, 234)

TO_RESOURCES_POSITION = (678, 107)
TO_RESOURCES_COLOR = (206, 157, 70)

RESOURCES_VALIDATION_POSITION = (1217, 383)
RESOURCES_VALIDATION_COLOR = (247, 246, 243)

INCOMING_ATTACK_POSITION = (1085, 273)
INCOMING_ATTACK_COLOR = (214, 0, 0)

TROOPS_VALIDATION_POSITION = (1094, 575)
SLAVE_VALIDATION_COLOR = (67, 60, 55)
ASH_VALIDATION_COLOR = (217, 162, 21)

def random_pause_between_actions():
    time.sleep(random.randint(5, 10))

def is_queueing_build_finish():
    return not validate_position(QUEUEING_BUILDING_POSITION, CANCEL_BUILDING_COLOR)
 
def is_troops_avaliable():
    return validate_position(TROOPS_VALIDATION_POSITION, SLAVE_VALIDATION_COLOR) or validate_position(TROOPS_VALIDATION_POSITION, ASH_VALIDATION_COLOR)

def is_attack_incoming():
    return validate_position(INCOMING_ATTACK_POSITION, INCOMING_ATTACK_COLOR)


def move_and_click(position, color):
    pyautogui.moveTo(position[0], position[1])
    time.sleep(PAUSE_BETWEEN_POLLING)

    # if validate_position(pyautogui.position(), color):
    print("Execute CLICK")
    pyautogui.click()

def validate_position(position, color):
    px = pyautogui.pixel(position[0], position[1])
    if px == color:
        # print("Color validation match")
        return True
    else:
        # print("Not match", position)
        # print(color)
        # print(px)
        return False

def is_at_resources_page():
    return validate_position(RESOURCES_VALIDATION_POSITION, RESOURCES_VALIDATION_COLOR)


def check_queuing_building(queue_finish_status):
    if is_queueing_build_finish():
        if not queue_finish_status:
            send_telegram_message("Building in queue finished")
        return True
    else:
        return False

def check_available_troops(troops_avaliable_status):
    if is_troops_avaliable():
        if not troops_avaliable_status:
            send_telegram_message("Idle troops available")
        return True
    else:
        return False

def check_incoming_attack(incoming_attack_status):
    if is_attack_incoming():
        if not incoming_attack_status:
            send_telegram_message("INCOMING ATTACK")
        return True
    else:
        return False

def send_telegram_message(message):
    requests.get(
        f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage?chat_id={TELEGRAM_CHAT_ID}&text={message}")

def refresh_page():
    move_and_click(REFRESH_POSITION, None)

queue_finish_status = False
troops_avaliable_status = False
incoming_attack_status = False

poll_count = 0
while True:
    if poll_count == REFRESH_POLL_COUNT:
        # refresh_page()
        poll_count = 0
        continue

    if is_at_resources_page():
        # queue_finish_status = check_queuing_building(queue_finish_status)
        # troops_avaliable_status = check_available_troops(troops_avaliable_status)
        incoming_attack_status = check_incoming_attack(incoming_attack_status)
        print("Polling...")
    else:
        print("Not at resources page, please navigate to the resources page")
    time.sleep(PAUSE_BETWEEN_POLLING)

    poll_count += 1



# while True:
#     px = pyautogui.pixel(TROOPS_VALIDATION_POSITION[0], TROOPS_VALIDATION_POSITION[1])
#     print(f"Color: {px}")
#     time.sleep(5)
