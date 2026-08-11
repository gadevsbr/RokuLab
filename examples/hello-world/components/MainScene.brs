sub init()
  print "Hello from BrightScript"
  m.top.findNode("title").text = "Hello from RokuLab"
  m.top.observeField("ready", "onReady")
  m.top.ready = true
end sub

sub onReady(event as object)
  print "Observer fired: "; event.getData()
end sub
