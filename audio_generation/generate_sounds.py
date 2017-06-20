import argparse
import os
import subprocess
import time
import random
import sys

presets = ['pickup', 'laser', 'explosion', 'powerup', 'hit', 'jump', 'blip']

parser = argparse.ArgumentParser(description='Generate sound effects using SFXR CLI', fromfile_prefix_chars="@")
parser.add_argument('-d', dest='destination_path', action='store', type=str, default=".", help="Where do you want the sounds to be exported?")
parser.add_argument('-a', dest='amount', action='store', type=int, default=1, help='How many sounds do you want to generate?')
parser.add_argument('-m', dest='mode', action='store', type=int, default=0, help='Mode: 0=generate a random sounds, 1=generate a for each preset' )
parser.add_argument('-no', dest='number_offset', action='store', type=int, default=0, help='Number offset for file naming' )

args = parser.parse_args()

if args.destination_path != '' and not os.path.exists(args.destination_path):
    os.makedirs(args.destination_path)

if args.amount == 0:
    args.amount = 1
    print ("No amount (-a) specified, generating 1 file")

def generate_random(i):
    path = os.path.join(args.destination_path, '%d.wav' % parser.number_offset + i)
    subprocess.call(['lib/sfxr', '--seed', str(random.randint(0, sys.maxsize)), '--randomize', '--export', path])

def generate_each_preset(i):
    for preset in presets:
        path = os.path.join(args.destination_path, '%s_%d.wav' % (preset, parser.number_offset + i))
        subprocess.call(['lib/sfxr', '--seed', str(random.randint(0, sys.maxsize)), '--generate-%s' % preset, '--export', path])

for i in range(args.amount):
    if args.mode == 0:
        generate_random(i)
    elif args.mode == 1:
        generate_each_preset(i)
